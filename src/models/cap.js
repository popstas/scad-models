const { difference, cylinder, union } = require('scad-js');

function generator(params) {
  const height = parseFloat(params.height);
  const inner_diam = parseFloat(params.inner_diam / 2) + 0.05; // 0.05 - gap for better fit
  const inner2_height = parseFloat(params.inner2_height);
  const wall = parseFloat(params.wall);

  const bottomPart = cylinder(wall, inner_diam, {center: false})
    .translate([ 0, 0, 0 ]);

  const borderOuter = difference(
    cylinder(height, inner_diam + wall, {center: false}),
    cylinder(height, inner_diam, {center: false}),
  ).translate([ 0, 0, 0 ]);

  const borderInner = difference(
    cylinder(inner2_height, inner_diam - wall - 0.25, {center: false}),
    cylinder(inner2_height, inner_diam - wall*2 - 0.25, {center: false}),
  ).translate([ 0, 0, 0 ]);

  return union(
    bottomPart,
    borderOuter,
    borderInner,
  );
}

module.exports = {
  generator,
  name: 'cap',
  label: 'Cap',
  label_ru: 'Крышка',
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
      default: 5,
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

  presets: [
    {
      name: 'For small cup',
      name_ru: 'Под маленькую баночку',
      params: {
        wall: 0.8,
        height: 3,
        inner_diam: 11.6,
        inner2_height: 5,
      }
    },
    {
      name: 'For small funnel',
      name_ru: 'Под маленькую воронку',
      params: {
        wall: 0.8,
        height: 3,
        inner_diam: 9.4,
        inner2_height: 5,
      }
    },
  ],
};