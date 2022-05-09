const { difference, cylinder } = require('scad-js');

function generator(params) {
  const inner = parseFloat(params.inner / 2);
  const outer = parseFloat(params.outer / 2);
  const wall = parseFloat(params.wall_width);

  return difference(
    cylinder(wall, outer, {center: false}),
    cylinder(wall, inner, {center: false}),
  )
    // .translate([0, 0, 0])
    // .rotate([0, 0, 0]);
}

module.exports = {
  generator,
  name: 'shim',
  label: 'Шайба',
  params: [
    {
      label: 'Толщина стенки',
      name: 'wall_width',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Диаметр отверстия',
      name: 'inner',
      type: 'input',
      default: 5,
    },
    {
      label: 'Диаметр шайбы',
      name: 'outer',
      type: 'input',
      default: 10,
    },
  ],

  presets: [
    {
      name: '5mm x 10mm',
      params: {
        wall_width: 1,
        inner: 5,
        outer: 10,
      }
    },
  ],
}