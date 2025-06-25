// @ts-nocheck
import scad from 'scad-js';
const { difference, cube, rounded_cube } = scad;

function generator(params) {
  const wall = parseFloat(params.wall);
  const width = parseFloat(params.width);
  const height = parseFloat(params.height);
  const depth = parseFloat(params.depth);
  const round_size = parseFloat(params.round_size);

  // cube([width, depth, wall], { center: false }).translate([0, 0, wall]),
  return difference(
    // cube([width, depth, height], { center: false }).translate([0, 0, 0]),
    // cube([width-wall*2, depth-wall*2, height], { center: false }).translate([wall, wall, wall])
    rounded_cube([width, depth, height], round_size, { center: false }).translate([0, 0, 0]),
    rounded_cube([width-wall*2, depth-wall*2, height], round_size, { center: false }).translate([wall, wall, wall]),
  ).translate(0, params.height, params.height * -1);
}

export default {
  generator,
  name: 'box',
  label: 'Box',
  label_ru: 'Коробка',
  preview: '/previews/box.png',

  params: [
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Round size',
      label_ru: 'Диаметр скругления',
      name: 'round_size',
      type: 'input',
      default: 1,
    },
    {
      label: 'Width',
      label_ru: 'Ширина',
      name: 'width',
      type: 'input',
      default: 50,
    },
    {
      label: 'Height',
      label_ru: 'Высота',
      name: 'height',
      type: 'input',
      default: 50,
    },
    {
      label: 'Depth',
      label_ru: 'Глубина',
      name: 'depth',
      type: 'input',
      default: 50,
    },
  ],

};
