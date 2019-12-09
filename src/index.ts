import * as d3 from 'd3';

const body = d3.select(document.body);

body.append('p').text('Scrolls');

const height = 500, width = 500;

const canvas = body.append('canvas')
  .attr('width', width)
  .attr('height', height);


const ctx = canvas.node().getContext('2d');

const lineWidth = 4;
let radius = height / 4;
ctx.translate(width/2, height/2);
ctx.beginPath();
ctx.strokeStyle = 'black';
ctx.lineWidth = lineWidth;
ctx.moveTo(0, 0);
ctx.lineTo(0, height/2 - radius - lineWidth);
ctx.translate(0, height/2 - radius - lineWidth);
ctx.stroke();

function spiral(radius, step=Math.PI/4) {
  const direction = -1;
  const steps = Math.PI*2/step;

  step = direction * step;


  // translate to first center
  ctx.save();
  ctx.translate(radius, 0);

  let r, nextRadius = radius;
  let angle = Math.PI;

  for (let i = 0; i < steps; i++) {
    r = nextRadius
    ctx.arc(0, 0, r, angle, angle+step, direction == -1);
    nextRadius = r * 0.95;
    angle = angle + step;
    ctx.translate(Math.cos(angle)*(r - nextRadius), Math.sin(angle)*(r - nextRadius));
  }
  ctx.restore();
}

spiral(radius);
ctx.stroke();

// ctx.arc(radius, 0, radius, Math.PI, Math.PI/2, true)
// ctx.translate(radius, radius);
// 
// radius = radius * 2 / 3; 
// ctx.arc(0, -radius, radius, Math.PI/2, 0, true);
// ctx.transform(0, -radius);
// ctx.stroke();
