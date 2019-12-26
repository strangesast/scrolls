import * as d3 from 'd3';

const svg = d3.select(document.querySelector('svg'));

const margins = { top: 20, right: 10, bottom: 20, left: 40 };

const zoom = d3.zoom()
  .scaleExtent([1, 4])
  .on('zoom', zoomed);

const x = d3.scaleLinear()
  .domain([0, 1]);

const y = d3.scaleLinear()
  .domain([0, 1]);

const xAxis = d3.axisBottom(x)
  .ticks(10);

const yAxis = d3.axisLeft(y)
  .ticks(10);

// const view = svg.append('rect')
//   .attr('width', 100)
//   .attr('height', 100);

const gX = svg.append('g')
  .classed('axis axis--x', true)
  .call(xAxis);

const gY = svg.append('g')
  .classed('axis axis--y', true)
  .call(yAxis);

svg.call(zoom);

function updateSize() {
  const { width, height } = svg.node().getBoundingClientRect();
  // svg.attr('width', width).attr('height', height);
  zoom.translateExtent([[0, 0], [width, height]])
  x.range([margins.left, width - margins.right]);
  y.range([height - margins.bottom, margins.top]);
  gX.call(xAxis).attr('transform', `translate(0,${height - margins.bottom})`);
  gY.call(yAxis).attr('transform', `translate(${margins.left},0)`);
  svg.call(zoom.transform, d3.zoomIdentity);
}

function zoomed() {
  const t = d3.event.transform;
  // view.attr('transform', t);
  gX.call(xAxis.scale(t.rescaleX(x)));
  gY.call(yAxis.scale(t.rescaleY(y)));
}

function debounce(fn) {
  let timeout;
  return () => {
    clearTimeout(timeout)
    timeout = setTimeout(fn, 200);
  };
}

const updateSizeDebounce = debounce(updateSize);

updateSize();
window.addEventListener('resize', updateSizeDebounce);
