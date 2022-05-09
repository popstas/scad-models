const { difference, cylinder, union } = require('scad-js');

function generator(params) {
  params.part1_diam = parseFloat(params.part1_diam / 2);
  params.part3_diam = parseFloat(params.part3_diam / 2);
  const wall = parseFloat(params.wall_width); //0.8; //толщина стенок

  params.part1_height = parseFloat(params.part1_height);
  params.part2_height = parseFloat(params.part2_height);
  params.part3_height = parseFloat(params.part3_height);

  // params.part3_top = parseFloat(params.part3_top / 2);
  // params.part3_bottom = parseFloat(params.part3_top / 2);

  // const obod = 5.9; //кольцо,широкая часть с ободом (радиус):

  const partOffset = [
    0,
    params.part1_height,
    params.part1_height + params.part2_height,
  ];
  // console.log("partOffset:", partOffset);

  const topPart = difference(
    cylinder(params.part1_height, params.part1_diam, {center: false}),
    cylinder(params.part1_height, params.part1_diam - wall, {center: false}),
  ).translate([ 0, 0, partOffset[0] ]);

  const middlePart = difference(
    cylinder(params.part2_height, [params.part1_diam, params.part3_diam], {center: false}),
    cylinder(params.part2_height, [params.part1_diam - wall, params.part3_diam - wall], {center: false}),
  ).translate([ 0, 0, partOffset[1] ]);

  const bottomPart = difference(
    cylinder(params.part3_height, params.part3_diam, {center: false}),
    cylinder(params.part3_height, params.part3_diam - wall, {center: false}),
  ).translate([ 0, 0, partOffset[2] ]);

  return union(
    topPart,
    middlePart,
    bottomPart,
  );
}

module.exports = {
  generator,
}