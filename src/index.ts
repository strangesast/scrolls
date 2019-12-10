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
  step = Math.PI / 4,
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
  radiusFrac: 0.5,
  curlFrac: 0.5,
  curlRate: 0,
};

function redraw() {
  const lineWidth = 4;
  const radius = (height / 4) * state.radiusFrac;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = lineWidth;
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height / 2 - radius - lineWidth);
  ctx.translate(0, height / 2 - radius - lineWidth);
  spiral(radius, (Math.PI * 4) * state.curlFrac,
    (r, i) => r * 0.95 * (i + 1) ** state.curlRate, 1, 0);
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
  spiral(radius, (Math.PI * 4) * state.curlFrac,
    (r, i) => r * 0.95 * (i + 1) ** state.curlRate, 1, Math.PI);
  ctx.stroke();
  ctx.restore();
}

redraw();


const controls = [
  {
    name: 'radius', type: 'range', min: 1, max: 100,
  },
  {
    name: 'curl', type: 'range', min: 1, max: 100,
  },
  {
    name: 'curlRate', type: 'range', min: 40, max: 60,
  },

];

{
  const e = body.selectAll('div.control').data(controls)
    .enter().append('div')
    .classed('control', true);

  e.each(function draw(d, i) {
    const s = d3.select(this);
    const id = `input-${i}-${d.name}`;
    s.append('label').attr('for', id).text(d.name);
    s.append('input').attr('type', d.type).attr('id', id).attr('min', d.min)
      .attr('max', d.max);
  });

  e.on('input', (d) => {
    switch (d.name) {
      case 'radius':
        state.radiusFrac = d3.event.target.value / 100;
        break;
      case 'curl':
        state.curlFrac = d3.event.target.value / 100;
        break;
      case 'curlRate':
        state.curlRate = (d3.event.target.value - 50) / 50;
        break;
      default:
        //
    }
    redraw();
  });
}
