import scad from 'scad-js';
const { difference, cube } = scad;

function generator(params) {
  const wall = parseFloat(params.wall);
  const width = parseFloat(params.width);
  const height = parseFloat(params.height);
  const depth = parseFloat(params.depth);

  return difference(
    cube([width, depth, height], { center: true }),
    cube([width-wall*2, depth-wall*2, height], { center: true }),
  );
}

export default {
  generator,
  name: 'frame',
  label: 'Frame',
  label_ru: 'Рамка',
  preview: '/previews/box.png',

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
