const { difference, cylinder, union } = require('scad-js');

function generator(params) {
  params.part1_diam = parseFloat(params.part1_diam / 2);
  params.part3_diam = parseFloat(params.part3_diam / 2);
  const wall = parseFloat(params.wall); //0.8; //толщина стенок

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
  label: 'Funnel',
  label_ru: 'Воронка',
  preview: '/previews/funnel.png',
  params: [
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Narrow Diameter',
      label_ru: 'Узкий диаметр',
      name: 'part3_diam',
      type: 'input',
      default: 15,
    },

    {
      label: 'Narrow Height',
      label_ru: 'Узкая высота',
      name: 'part3_height',
      type: 'input',
      default: 10
    },
    {
      label: 'Middle Height',
      label_ru: 'Середина: высота',
      name: 'part2_height',
      type: 'input',
      default: 20,
    },
    {
      label: 'Wide Height',
      label_ru: 'Широкая высота',
      name: 'part1_height',
      type: 'input',
      default: 10,
    },
    {
      label: 'Wide Diameter',
      label_ru: 'Широкий диаметр',
      name: 'part1_diam',
      type: 'input',
      default: 9.64
    },
  ],
  presets: [
    {
      name: 'Small',
      name_ru: 'Маленькая',
      id: 'small',
      params: {
        wall: 0.8,
        part1_diam: 33.8,
        part3_diam: 9.64,
        part1_height: 5,
        part2_height: 20,
        part3_height: 5,
      }
    },
    {
      name: 'Medium',
      name_ru: 'Под полторашку',
      id: 'medium',
      params: {
        wall: 0.8,
        part1_diam: 80,
        part3_diam: 21,
        part1_height: 5,
        part2_height: 70,
        part3_height: 20,
      }
    },
    {
      name: 'Big',
      name_ru: 'Большая',
      id: 'big',
      params: {
        wall: 1,
        part1_diam: 100,
        part3_diam: 32.2,
        part1_height: 5,
        part2_height: 60,
        part3_height: 20,
      }
    },
    {
      name: 'Big to med',
      name_ru: 'Переходник с большой на полторашку',
      id: 'big_to_med',
      params: {
        wall: 1,
        part1_diam: 34.4,
        part3_diam: 21,
        part1_height: 5,
        part2_height: 20,
        part3_height: 25,
      }
    },
  ]
}