const { difference, cylinder, union } = require('scad-js');

function generator(params) {
  const height = parseFloat(params.height);
  const top_diam = parseFloat(params.top_diam / 2);
  const bottom_diam = parseFloat(params.bottom_diam / 2);
  const wall = parseFloat(params.wall_width); //0.8; //толщина стенок

  const topPart = difference(
    cylinder(height, [top_diam, bottom_diam], {center: false}),
    cylinder(height, [top_diam - wall, bottom_diam - wall], {center: false}),
  ).translate([ 0, 0, 0 ]);

  const bottomPart = cylinder(wall, bottom_diam, {center: false})
    .translate([ 0, 0, 0 ]);

  return union(
    topPart,
    bottomPart,
  );
}

module.exports = {
  generator,
}