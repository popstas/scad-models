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
  name: 'funnel',
  label: 'Воронка',
  params: [
    {
      label: 'Толщина стенки',
      name: 'wall_width',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Верх: диаметр',
      name: 'part1_diam',
      type: 'input',
      default: 9.64
    },
    {
      label: 'Низ: диаметр',
      name: 'part3_diam',
      type: 'input',
      default: 15,
    },

    {
      label: 'Верх: высота',
      name: 'part1_height',
      type: 'input',
      default: 10,
    },
    {
      label: 'Середина: высота',
      name: 'part2_height',
      type: 'input',
      default: 20,
    },
    {
      label: 'Низ: высота',
      name: 'part3_height',
      type: 'input',
      default: 10
    },
  ],
  presets: [
    {
      name: 'Маленькая',
      params: {
        wall_width: 0.8,
        part1_diam: 33.8,
        part3_diam: 9.64,
        part1_height: 5,
        part2_height: 20,
        part3_height: 5,
      }
    },
    {
      name: 'Большая',
      params: {
        wall_width: 0.8,
        part1_diam: 100,
        part3_diam: 31.8,
        part1_height: 5,
        part2_height: 60,
        part3_height: 20,
      }
    },
    {
      name: 'Под полторашку',
      params: {
        wall_width: 0.8,
        part1_diam: 80,
        part3_diam: 21,
        part1_height: 5,
        part2_height: 70,
        part3_height: 20,
      }
    },
    {
      name: 'Переходник на большую воронку',
      params: {
        wall_width: 1,
        part1_diam: 34.9,
        part3_diam: 34.9,
        part1_height: 0,
        part2_height: 0,
        part3_height: 20,
      }
    },
  ]
}