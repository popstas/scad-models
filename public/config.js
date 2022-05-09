const config = {
  cache_enabled: true,
  cachePath: './data/cache',
  port: 3014,
  models: [
    {
      name: 'funnel',
      label: 'Воронка',
      params: [
        {
          label: 'Толщина стенки',
          name: 'wall_width',
          type: 'input',
          default: 0.8,
        },
        {
          label: 'Верх: диаметр',
          name: 'part1_diam',
          type: 'input',
          default: 9.64
        },
        {
          label: 'Низ: диаметр',
          name: 'part3_diam',
          type: 'input',
          default: 15,
        },

        {
          label: 'Верх: высота',
          name: 'part1_height',
          type: 'input',
          default: 10,
        },
        {
          label: 'Середина: высота',
          name: 'part2_height',
          type: 'input',
          default: 20,
        },
        {
          label: 'Низ: высота',
          name: 'part3_height',
          type: 'input',
          default: 10
        },
      ],
      presets: [
        {
          name: 'Маленькая',
          params: {
            wall_width: 0.8,
            part1_diam: 33.8,
            part3_diam: 9.64,
            part1_height: 5,
            part2_height: 20,
            part3_height: 5,
          }
        },
        {
          name: 'Большая',
          params: {
            wall_width: 0.8,
            part1_diam: 100,
            part3_diam: 31.8,
            part1_height: 5,
            part2_height: 60,
            part3_height: 20,
          }
        },
        {
          name: 'Под полторашку',
          params: {
            wall_width: 0.8,
            part1_diam: 80,
            part3_diam: 21,
            part1_height: 5,
            part2_height: 70,
            part3_height: 20,
          }
        },
        {
          name: 'Переходник на большую воронку',
          params: {
            wall_width: 1,
            part1_diam: 34.9,
            part3_diam: 34.9,
            part1_height: 0,
            part2_height: 0,
            part3_height: 20,
          }
        },
      ]
    },

    {
      name: 'shim',
      label: 'Шайба',
      params: [
        {
          label: 'Толщина стенки',
          name: 'wall_width',
          type: 'input',
          default: 0.8,
        },
        {
          label: 'Диаметр отверстия',
          name: 'inner',
          type: 'input',
          default: 5,
        },
        {
          label: 'Диаметр шайбы',
          name: 'outer',
          type: 'input',
          default: 10,
        },
      ],

      presets: [
        {
          name: '5mm x 10mm',
          params: {
            wall_width: 1,
            inner: 5,
            outer: 10,
          }
        },
      ],
    },

    {
      name: 'cup',
      label: 'Чашка / банка',
      params: [
        {
          label: 'Толщина стенки',
          name: 'wall_width',
          type: 'input',
          default: 0.8,
        },
        {
          label: 'Высота',
          name: 'height',
          type: 'input',
          default: 50,
        },
        {
          label: 'Верхний диаметр',
          name: 'top_diam',
          type: 'input',
          default: 10,
        },
        {
          label: 'Нижний диаметр',
          name: 'bottom_diam',
          type: 'input',
          default: 10,
        },
      ],
      presets: [
        {
          name: 'Маленькая баночка',
          params: {
            wall_width: 1.0,
            height: 40,
            top_diam: 11.6,
            bottom_diam: 11.6,
          }
        },
        {
          name: 'Баночка под маленькую воронку-крышку',
          params: {
            wall_width: 1.0,
            height: 40,
            top_diam: 32.2,
            bottom_diam: 32.2,
          }
        },
      ],
    },

    {
      name: 'cap',
      label: 'Крышка',
      params: [
        {
          label: 'Толщина стенки',
          name: 'wall_width',
          type: 'input',
          default: 0.8,
        },
        {
          label: 'Высота',
          name: 'height',
          type: 'input',
          default: 5,
        },
        {
          label: 'Снаружи на диаметр',
          name: 'inner_diam',
          type: 'input',
          default: 10,
        },
        {
          label: 'Высота внутренней пипки',
          name: 'inner2_height',
          type: 'input',
          default: 2,
        },
      ],

      presets: [
        {
          name: 'Под маленькую баночку',
          params: {
            wall_width: 0.8,
            height: 3,
            inner_diam: 11.6,
            inner2_height: 5,
          }
        },
        {
          name: 'Под маленькую воронку',
          params: {
            wall_width: 0.8,
            height: 3,
            inner_diam: 9.4,
            inner2_height: 5,
          }
        },
      ],
    },
  ],
};
module.exports = config;