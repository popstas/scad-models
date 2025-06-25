// @ts-nocheck
import scad from 'scad-js';
const { difference, cylinder, union } = scad;

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
    cylinder(params.part1_height, params.part1_diam, { center: false }),
    cylinder(params.part1_height, params.part1_diam - wall, { center: false }),
  ).translate([0, 0, partOffset[0]]);

  const middlePart = difference(
    cylinder(params.part2_height, [params.part1_diam, params.part3_diam], { center: false }),
    cylinder(params.part2_height, [params.part1_diam - wall, params.part3_diam - wall], { center: false }),
  ).translate([0, 0, partOffset[1]]);

  const bottomPart = difference(
    cylinder(params.part3_height, params.part3_diam, { center: false }),
    cylinder(params.part3_height, params.part3_diam - wall, { center: false }),
  ).translate([0, 0, partOffset[2]]);

  return union(
    topPart,
    middlePart,
    bottomPart,
  );
}

export default {
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
};
