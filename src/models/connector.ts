import scad from 'scad-js';
import type { ModelDefinition } from '../types.js';
const { difference, cylinder, union } = scad;

// console.log(`scad: `, scad);
function generator(params: Record<string, any>): any {
  params.part1_diam = Number(params.part1_diam / 2);
  params.part2_diam = Number(params.part2_diam / 2);
  params.part3_diam = Number(params.part3_diam / 2);
  const wall = Number(params.wall); //0.8; //толщина стенок

  params.part1_height = Number(params.part1_height);
  params.part2_height = Number(params.part2_height);
  params.part3_height = Number(params.part3_height);

  // params.part3_top = Number(params.part3_top / 2);
  // params.part3_bottom = Number(params.part3_top / 2);

  // const obod = 5.9; //кольцо,широкая часть с ободом (радиус):

  const partOffset = [
    0,
    params.part1_height,
    params.part1_height + params.part2_height,
  ];
  // console.log("partOffset:", partOffset);

  const topPart = difference(
    cylinder(params.part1_height, params.part1_diam, { center: false }),
    cylinder(params.part1_height, params.part1_diam - wall, { center: false })
  ).translate([0, 0, partOffset[0]]);

  const middlePart = difference(
    cylinder(params.part2_height, params.part2_diam, { center: false }),
    cylinder(params.part2_height, params.part1_diam - wall, { center: false })
  ).translate([0, 0, partOffset[1]]);

  const bottomPart = difference(
    cylinder(params.part3_height, params.part3_diam, { center: false }),
    cylinder(params.part3_height, params.part3_diam - wall, { center: false })
  ).translate([0, 0, partOffset[2]]);

  const allParts = union(topPart, middlePart, bottomPart);

  return allParts;
}

const model: ModelDefinition = {
  generator,
  name: 'connector',
  label: 'Connector',
  label_ru: 'Соединитель',
  preview: '/previews/connector.png',

  params: [
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
      type: 'input',
      default: 0.8,
    },

    {
      label: 'part1 Diameter',
      label_ru: 'part1 диаметр',
      name: 'part1_diam',
      type: 'input',
      default: 15,
    },
    {
      label: 'part1 Height',
      label_ru: 'part1 высота',
      name: 'part1_height',
      type: 'input',
      default: 10,
    },

    {
      label: 'part2 Diameter',
      label_ru: 'part2 диаметр',
      name: 'part2_diam',
      type: 'input',
      default: 20,
    },
    {
      label: 'part2 Height',
      label_ru: 'part2 высота',
      name: 'part2_height',
      type: 'input',
      default: 1,
    },

    {
      label: 'part3 Diameter',
      label_ru: 'part3 диаметр',
      name: 'part3_diam',
      type: 'input',
      default: 0,
    },
    {
      label: 'part3 Height',
      label_ru: 'part3 высота',
      name: 'part3_height',
      type: 'input',
      default: 0,
    },
  ],
};

export default model;
