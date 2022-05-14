const config = {
  cache_enabled: true,
  cachePath: './data/cache',
  material: {
    density: 1.39, // matches PetG in Cura
  },
  port: 3014,
  kits: [
    {
      name: 'Small funnel, small bottle, caps',
      name_ru: 'Маленькая воронка, маленькая баночка, крышечки',
      items: [
        {
          model: 'funnel',
          id: 'small',
        },
        {
          model: 'funnel',
          id: 'big',
        },
        {
          model: 'funnel',
          id: 'big_to_med',
        },
        {
          model: 'cup',
          id: 'small',
        },
        {
          model: 'cup',
          id: 'for_funnels',
        },
        {
          model: 'cap',
          id: 'for_small_cup',
        },
        {
          model: 'cap',
          id: 'for_small_funnel',
        },
        {
          model: 'cap',
          id: 'connector_for_big_funnel',
        },
      ]
    }
  ],
};
module.exports = config;
