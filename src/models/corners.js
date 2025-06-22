import scad from 'scad-js';
const { difference, cylinder, union, g } = scad;

function generator(params) {
  console.log({params})
  const height = parseFloat(params.height);
  const bottom_height = parseFloat(params.bottom_height);
  const radius = parseFloat(params.diameter / 2);
  const hole_radius = parseFloat(params.hole / 2);
  const wall = parseFloat(params.wall);
  const count = parseInt(params.count);


  return union(difference(
    cylinder(height, radius, { center: false, $fn: count }),
    cylinder(height, radius - wall, { center: false, $fn: count }),
  ), difference(
    cylinder(bottom_height, radius, { $fn: count }),
    cylinder(bottom_height, hole_radius, { $fn: count }),
  ));
}

export default {
  generator,
  name: 'corners',
  label: 'Corners',
  label_ru: 'Многогранник',
  preview: '/previews/corners.png',

  params: [
    {
      label: 'Diameter',
      label_ru: 'Диаметр',
      name: 'diameter',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Hole diameter',
      label_ru: 'Диаметр тверстия',
      name: 'hole',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Height',
      label_ru: 'Высота',
      name: 'height',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Corners count',
      label_ru: 'Количество углов',
      name: 'count',
      type: 'input',
      default: 7,
    },
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Bottom height',
      label_ru: 'Толщина дна',
      name: 'bottom_height',
      type: 'input',
      default: 1,
    },

  ],

  presets: [
    {
      name: '~66mm x 68mm',
      params: {
        bottom_height: 8,
        wall: 8,
        count: 7,
        diameter: 70,
        height: 70,
        hole: 0,
      }
    },
  ],
};
