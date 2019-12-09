import * as d3 from 'd3';

const body = d3.select(document.body);

body.append('p').text('D3 starter works');

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

function spiral(radius) {
  const step = -Math.PI / 2;
  let x = radius, y = 0;
  for (let angle = Math.PI; angle > -Math.PI; angle += step) {
    ctx.arc(radius, 0, radius, angle, angle + step, true);
    console.log(`angle ${angle}`);
  }
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
