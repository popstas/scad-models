import scad from 'scad-js';
const { difference, cylinder } = scad;

function generator(params) {
  const inner = parseFloat(params.inner / 2);
  const outer = parseFloat(params.outer / 2);
  const wall = parseFloat(params.wall);

  return difference(
    cylinder(wall, outer, { center: false }),
    cylinder(wall, inner, { center: false }),
  );
}

export default {
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
