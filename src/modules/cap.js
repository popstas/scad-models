const { difference, cylinder, union } = require('scad-js');

function generator(params) {
  const height = parseFloat(params.height);
  const inner_diam = parseFloat(params.inner_diam / 2) + 0.05; // 0.05 - gap for better fit
  const inner2_height = parseFloat(params.inner2_height);
  const wall = parseFloat(params.wall_width);

  const bottomPart = cylinder(wall, inner_diam, {center: false})
    .translate([ 0, 0, 0 ]);

  const borderOuter = difference(
    cylinder(height, inner_diam + wall, {center: false}),
    cylinder(height, inner_diam, {center: false}),
  ).translate([ 0, 0, 0 ]);

  const borderInner = difference(
    cylinder(inner2_height, inner_diam - wall - 0.25, {center: false}),
    cylinder(inner2_height, inner_diam - wall*2 - 0.25, {center: false}),
  ).translate([ 0, 0, 0 ]);

  return union(
    bottomPart,
    borderOuter,
    borderInner,
  );
}

module.exports = {
  generator,
}