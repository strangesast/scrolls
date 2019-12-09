import * as d3 from 'd3';

const body = d3.select(document.body);

body.append('p').text('Scrolls');

const height = 500;
const width = 500;

const canvas = body.append('canvas')
  .attr('width', width)
  .attr('height', height);


const ctx = canvas.node().getContext('2d');

function spiral(radius, step = Math.PI / 4, direction = -1) {
  const steps = (2 * Math.PI) / step;


  // translate to first center
  ctx.save();
  ctx.translate(radius, 0);

  let r;
  let nextRadius = radius;
  let angle = Math.PI;

  for (let i = 0; i < steps; i += 1) {
    r = nextRadius;
    ctx.arc(0, 0, r, angle, angle + step * direction, direction === -1);
    nextRadius = r * 0.95;
    angle += step * direction;
    ctx.translate(Math.cos(angle) * (r - nextRadius), Math.sin(angle) * (r - nextRadius));
  }
  ctx.restore();
}


{
  const lineWidth = 4;
  const radius = height / 4;
  ctx.translate(width / 2, height / 2);
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = lineWidth;
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height / 2 - radius - lineWidth);
  ctx.translate(0, height / 2 - radius - lineWidth);
  spiral(radius);
  ctx.stroke();
}
