import * as d3 from 'd3';

const body = d3.select(document.body);

body.append('p').text('Scrolls');

const height = 500;
const width = 500;

const canvas = body.append('canvas')
  .attr('width', width)
  .attr('height', height);

const ctx = canvas.node().getContext('2d');

function spiral(
  radius,
  curl = 2 * Math.PI,
  curlRate = (r, i) => r * 0.95, // eslint-disable-line no-unused-vars
  direction = -1,
  startAngle = Math.PI,
  step = Math.PI / 8,
) {
  const steps = curl / step;

  // translate to first center
  ctx.save();
  ctx.translate(-direction * (startAngle >= Math.PI ? -1 : 1) * radius, 0);

  let r;
  let nextRadius = radius;
  let angle = startAngle;

  for (let i = 0; i < steps; i += 1) {
    r = nextRadius;
    ctx.arc(0, 0, r, angle, angle + step * direction, direction === -1);
    nextRadius = curlRate(r, i);
    angle += step * direction;
    ctx.translate(Math.cos(angle) * (r - nextRadius), Math.sin(angle) * (r - nextRadius));
  }
  ctx.restore();
}


const state = {
  rotation: 0,
  radius: 0.5,
  curlFrac: 0.5,
  curlRate: 0,
  curlAmount: 0.95,
};

function redraw() {
  const lineWidth = 4;
  const radius = (height / 5) * state.radius;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(state.rotation);
  ctx.translate(-width / 2, -height / 2);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = lineWidth;
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height / 2 - radius - lineWidth);
  ctx.translate(0, height / 2 - radius - lineWidth);

  const spiralArgs = [radius, (Math.PI * 4) * state.curlFrac,
    (r, i) => r * state.curlAmount * (i + 1) ** state.curlRate];
  // @ts-ignore
  spiral(...spiralArgs, 1, 0);

  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = lineWidth;
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -height / 2 + radius + lineWidth);
  ctx.translate(0, -height / 2 + radius + lineWidth);
  // @ts-ignore
  spiral(...spiralArgs, 1, Math.PI);
  ctx.stroke();
  ctx.restore();
  ctx.restore();
}


const controls = [
  {
    name: 'rotation', type: 'range', min: -Math.PI / 2, max: Math.PI / 2, step: 0.1,
  },
  {
    name: 'radius', type: 'range', min: 0, max: 1, step: 0.1,
  },
  {
    name: 'curlFrac', type: 'range', min: 0, max: 1, step: 0.1,
  },
  {
    name: 'curlRate', type: 'range', min: 47, max: 51, step: 0.1,
  },
  {
    name: 'curlAmount', type: 'range', min: 45, max: 55, step: 0.1,
  },

];

function drawControls() {
  const e = body.selectAll('div.control').data(controls)
    .enter().append('div')
    .classed('control', true);

  e.each(function draw(d, i) {
    const s = d3.select(this);
    const id = `input-${i}-${d.name}`;
    s.append('label').attr('for', id).text(d.name);
    s.append('input').attr('type', d.type)
      .attr('id', id)
      .attr('min', d.min)
      .attr('step', d.step || 1)
      .attr('max', d.max)
      .attr('value', state[d.name]);
  });

  e.on('input', (d) => {
    switch (d.name) {
      case 'rotation':
        // state.rotation = (d3.event.target.value - 50) * (Math.PI / 100);
        state.rotation = d3.event.target.value;
        break;
      case 'radius':
        state.radius = d3.event.target.value;
        break;
      case 'curlFrac':
        state.curlFrac = d3.event.target.value;
        break;
      case 'curlRate':
        state.curlRate = (d3.event.target.value - 50) / 50;
        break;
      case 'curlAmount':
        state.curlAmount = (d3.event.target.value) / 50;
        break;
      default:
        //
    }
    const url = new URL(window.location.href);
    url.search = new URLSearchParams(Object.entries(state)
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v.toString() }), {})).toString();
    window.history.replaceState({ path: url.href }, '', url.href);
    redraw();
  });
}


document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  Object.keys(state).forEach((key) => {
    state[key] = params.get(key) || state[key];
  });
  drawControls();
  redraw();
});
