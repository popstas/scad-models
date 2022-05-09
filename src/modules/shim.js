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
}