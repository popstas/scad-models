const { difference, cylinder, union } = require('scad-js');

function generator(params) {
  const height = parseFloat(params.height);
  const top_diam = parseFloat(params.top_diam / 2);
  const bottom_diam = parseFloat(params.bottom_diam / 2);
  const wall = parseFloat(params.wall); //0.8; //толщина стенок

  const topPart = difference(
    cylinder(height, [bottom_diam, top_diam,], { center: false }),
    cylinder(height, [bottom_diam - wall, top_diam - wall], { center: false }),
  ).translate([0, 0, 0]);

  const bottomPart = cylinder(wall, bottom_diam, { center: false })
    .translate([0, 0, 0]);

  return union(
    topPart,
    bottomPart,
  );
}

module.exports = {
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

  presets: [
    {
      name: 'Small cup',
      name_ru: 'Маленькая баночка',
      id: 'small',
      params: {
        wall: 1.0,
        height: 40,
        top_diam: 11.6,
        bottom_diam: 11.6,
      }
    },
    {
      name: 'Cup medium',
      name_ru: 'Баночка средняя',
      desc_ru: 'Подходит под маленькую воронку и под большую, с переходником.',
      id: 'medium',
      params: {
        wall: 1.0,
        height: 40,
        top_diam: 32.2,
        bottom_diam: 32.2,
      }
    },
    {
      name: 'Cup medium low',
      name_ru: 'Баночка средняя низкая',
      desc_ru: 'Подходит под маленькую воронку и под большую, с переходником.',
      id: 'medium',
      params: {
        wall: 1.0,
        height: 20,
        top_diam: 32.2,
        bottom_diam: 32.2,
      }
    },
  ],
};
