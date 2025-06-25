import scad from 'scad-js';
import type { ModelDefinition } from '../types.js';
const { difference, cube } = scad;

function generator(params: Record<string, any>): any {
  const wall = Number(params.wall);
  const width = Number(params.width);
  const height = Number(params.height);
  const depth = Number(params.depth);

  return difference(
    cube([width, depth, height], { center: true }),
    cube([width - wall * 2, depth - wall * 2, height], { center: true })
  );
}

const model: ModelDefinition = {
  generator,
  name: 'frame',
  label: 'Frame',
  label_ru: 'Рамка',
  preview: '/previews/frame.png',

  params: [
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
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

export default model;
