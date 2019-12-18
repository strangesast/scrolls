/* eslint-disable no-plusplus */
import * as d3 from 'd3';
import { active } from 'd3';

const body = d3.select(document.body);

const scrollTable = body.append('div').attr('id', 'scroll-table');
{
  scrollTable.append('p').text('Scrolls');
  scrollTable.append('table');
}
const inputsTable = body.append('div').attr('id', 'inputs-table');
{
  inputsTable.append('p');
  inputsTable.append('table');
}

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

let activeScroll = null;
const scrolls: Scroll[] = [];

interface Scroll {
  id: number;
  name: string;
  scroll: ScrollParams;
  stem: StemParams;
}

enum StemType {
  Cross = 'cross',
  Flat = 'flat',
  Arc = 'arc',
}

interface StemParams {
  length: number;
  type: StemType;
}

interface ScrollParams {
  rotation: number; // total rotation
  radius: number; // outer radius before curling
  curlFrac: number; // radians of rotation per step
  curlRate: number; // radius changes by amount to the power of curlRate
  curlAmount: number; // multiply radius by this amount each step
}

const defaultStemParams: StemParams = {
  length: 1,
  type: StemType.Flat,
};

const defaultScrollParams: ScrollParams = {
  rotation: 2 * Math.PI,
  radius: 1,
  curlFrac: Math.PI / 4,
  curlRate: 0,
  curlAmount: 0.95,
}

let lastScrollIndex = 0;

function createScroll(
  id = ++lastScrollIndex,
  name = `Scroll ${id}`,
  scrollArg: Partial<ScrollParams> = {},
  stemArg: Partial<StemParams> = {},
): void {
  const stem = { ...stemArg, ...defaultStemParams };
  const scroll = { ...scrollArg, ...defaultScrollParams };
  scrolls.push({ id, name, stem, scroll });
  updateScrollTable();
}

const inputs = [
  {
    type: 'number',
    label: 'Stem Length',
    path: 'stem.length',
    step: 0.1,
    min: 0,
    max: 10,
  },
  {
    type: 'radio',
    label: 'Stem Type',
    options: Object.keys(StemType).map(key => ({key, value: StemType[key]})),
    path: 'stem.type',
  },
  {
    type: 'number',
    label: 'Scroll Rotation',
    path: 'scroll.rotation',
    step: 0.1,
    min: 0,
    max: Math.PI * 4,
  },
  {
    type: 'number',
    label: 'Scroll Radius',
    path: 'scroll.radius',
    step: 0.1,
    min: 0,
    max: 10,
  },
  {
    type: 'number',
    label: 'Scroll Curl Step',
    path: 'scroll.curlFrac',
    step: 0.1,
    min: 0.01,
    max: Math.PI,
  },
  {
    type: 'number',
    label: 'Scroll Curl Rate',
    path: 'scroll.curlRate',
    step: 0.1,
    min: 0,
    max: 10,
  },
  {
    type: 'number',
    label: 'Scroll Curl Amount',
    path: 'scroll.curlAmount',
    step: 0.1,
    min: 0,
    max: 10,
  },
];

function setActiveScroll(scroll: Scroll): void {
  activeScroll = scroll;
  updateInputsTable();
}

function removeScroll(index: number): void {
  const [scroll] = scrolls.splice(index, 1);
  if (scroll === activeScroll) {
    activeScroll = null;
    hideInputsTable();
  }
  updateScrollTable();
}

function hideInputsTable() {
  inputsTable.style('visibility', 'hidden');
}

function updateScrollTable() {
  scrollTable.select('table').selectAll('tr').data(scrolls, (s: any) => s.id).join(
    (sel) => {
      const e = sel.append('tr');
      e.append('td').text(scroll => scroll.name);
      e.append('td').append('button').text('activate').on('click', (d) => {
        setActiveScroll(d);
      });
      e.append('td').append('button').text('remove').on('click', (d) => {
        let i = 0;
        // eslint-disable-next-line no-cond-assign
        if ((i = scrolls.indexOf(d)) > -1) {
          removeScroll(i);
        }
      });
      return e;
    },
    null,
    (sel) => sel.remove(),
  );
}

function updateInputsTable() {
  if (activeScroll == null) {
    return;
  }
  inputsTable.select('p').text(`${activeScroll.name} Attributes`);
  const sel = inputsTable.style('visibility', 'visible').select('table').selectAll('tr').data(inputs, (d: any) => d.path);
  const sele = sel.enter().append('tr')

  // eslint-disable-next-line func-names
  sele.each(function (props) {
    const tr = d3.select(this);
    const { label } = props;
    const base = label.toLowerCase().split(' ').join('-');
    switch (props.type) {
      case 'number': {
        tr.append('td').append('label')
          .attr('for', base).text(label);
        tr.append('td')
          .append('input')
          .attr('type', 'number')
          .attr('min', props.min)
          .attr('max', props.max)
          .attr('step', props.step)
          .attr('type', 'number');
        break;
      }
      case 'radio': {
        const { options } = props;
        tr.append('label').text(label);
        const d = tr.append('td');
        for (let i = 0; i < options.length; i++) {
          const {key, value} = options[i];
          const id = `${base}-${i}`;
          const dd = d.append('div');
          const inp = dd.append('input')
            .attr('type', 'radio')
            .attr('id', id)
            .attr('name', base)
            .attr('value', value);
          dd.append('label').attr('for', id).text(key);
        }
        break;
      }
      default: {
        // none
      }
    }
  });
  sele.on('input', (d) => {
    const newValue = d3.event.srcElement.value; // is string
    if (activeScroll != null) {
      const path = d.path.split('.');
      const [keys, key] = [path.slice(0, 1), path[path.length - 1]];
      const obj = keys.reduce((_obj, k) => _obj[k], activeScroll);
      // const currentValue = obj[key];
      switch (d.type) {
        case 'number':
          obj[key] = parseFloat(newValue);
          break;
        default:
          obj[key] = newValue;
      }
    }
  });

  // eslint-disable-next-line func-names
  sele.merge(sel as any).each(function (d) {
    const path = d.path.split('.');
    // get the current value;
    const cv = path.reduce((obj, k) => obj[k], activeScroll);
    const sel = d3.select(this);
    switch (d.type) {
      case 'number':
        sel.select('input').property('value', cv);
        break;
      case 'radio':
        // eslint-disable-next-line func-names
        sel.selectAll('input[type=radio]').property('checked', function () {
          return (this as any).value === cv;
        });
        break;
      default: {
        // pass
      }
    }
  });
}

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
  body.append('div').append('button').text('Add scroll').on('click', () => {
    createScroll();
  });

  // updateInputsTable();

  // const params = new URLSearchParams(window.location.search);
  // Object.keys(state).forEach((key) => {
  //   state[key] = params.get(key) || state[key];
  // });
  // drawControls();
  // redraw();
});
