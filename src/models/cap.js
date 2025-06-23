import scad from 'scad-js';
const { difference, cylinder, union } = scad;

function generator(params) {
  const height = parseFloat(params.height);
  const lid_height = parseFloat(params.lid_height);
  const inner_diam = parseFloat(params.inner_diam / 2);
  const inner2_height = parseFloat(params.inner2_height);
  const wall = parseFloat(params.wall);

  const bottomPart = cylinder(lid_height, inner_diam, { center: false })
    .translate([0, 0, 0]);

  const outGap = 0.01; // for better fit
  const inGap = 0.01; // -0.05 - too hard;

  const borderOuter = difference(
    cylinder(height, inner_diam + outGap + wall, { center: false }),
    cylinder(height, inner_diam + outGap, { center: false }),
  ).translate([0, 0, 0]);

  const borderInner = difference(
    cylinder(inner2_height, inner_diam - wall + inGap, { center: false }),
    cylinder(inner2_height, inner_diam - wall * 2 + inGap, { center: false }),
  ).translate([0, 0, 0]);

  return union(
    bottomPart,
    borderOuter,
    borderInner,
  );
}

export default {
  generator,
  name: 'cap',
  label: 'Cap',
  label_ru: 'Крышка',
  preview: '/previews/cap.png',

  params: [
    {
      label: 'Wall Thickness',
      label_ru: 'Толщина стенок',
      name: 'wall',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Wall Height',
      label_ru: 'Высота стенок',
      name: 'height',
      type: 'input',
      default: 5,
    },
    {
      label: 'Lid Height',
      label_ru: 'Высота крышки',
      name: 'lid_height',
      type: 'input',
      default: 0.8,
    },
    {
      label: 'Cup Diameter',
      label_ru: 'Снаружи на диаметр',
      name: 'inner_diam',
      type: 'input',
      default: 10,
    },
    {
      label: 'Inner Wall Height',
      label_ru: 'Высота внутренней пипки',
      name: 'inner2_height',
      type: 'input',
      default: 2,
    },
  ],

};
