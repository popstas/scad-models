import scad from 'scad-js';
import type { ModelDefinition } from '../types.js';
const { difference, cylinder } = scad;

function generator(params: Record<string, any>): any {
  const inner = Number(params.inner / 2);
  const outer = Number(params.outer / 2);
  const wall = Number(params.wall);

  return difference(
    cylinder(wall, outer, { center: false }),
    cylinder(wall, inner, { center: false })
  );
}

const model: ModelDefinition = {
  generator,
  name: 'shim',
  label: 'Shim',
  label_ru: 'Шайба',
  preview: '/previews/shim.png',

  params: [
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Hole Diameter',
      label_ru: 'Диаметр отверстия',
      name: 'inner',
      type: 'input',
      default: 5,
    },
    {
      label: 'Outer Diameter',
      label_ru: 'Диаметр шайбы',
      name: 'outer',
      type: 'input',
      default: 10,
    },
  ],
};

export default model;
