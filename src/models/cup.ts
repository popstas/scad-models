import scad from 'scad-js';
import type { ModelDefinition } from '../types.js';
const { difference, cylinder, union } = scad;

function generator(params: Record<string, any>): any {
  const height = Number(params.height);
  const top_diam = Number(params.top_diam / 2);
  const bottom_diam = Number(params.bottom_diam / 2);
  const wall = Number(params.wall); //0.8; //толщина стенок

  const topPart = difference(
    cylinder(height, [bottom_diam, top_diam], { center: false }),
    cylinder(height, [bottom_diam - wall, top_diam - wall], { center: false })
  ).translate([0, 0, 0]);

  const bottomPart = cylinder(wall, bottom_diam, { center: false }).translate([
    0, 0, 0,
  ]);

  return union(topPart, bottomPart);
}

const model: ModelDefinition = {
  generator,
  name: 'cup',
  label: 'Cup / Jar',
  label_ru: 'Чашка / банка',
  preview: '/previews/cup.png',

  params: [
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Height',
      label_ru: 'Высота',
      name: 'height',
      type: 'input',
      default: 50,
    },
    {
      label: 'Top Diameter',
      label_ru: 'Верхний диаметр',
      name: 'top_diam',
      type: 'input',
      default: 10,
    },
    {
      label: 'Bottom Diameter',
      label_ru: 'Нижний диаметр',
      name: 'bottom_diam',
      type: 'input',
      default: 10,
    },
  ],
};

export default model;
