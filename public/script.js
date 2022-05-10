async function start() {
  // mutations с записью тупо значения в state
  const mutationFabric = (names) => {
    const mutations = {};
    names.map((name) => {
      mutations[name] = (state, val) => {
        state[name] = val;
      };
    });
    return mutations;
  };

  // создаёт computed с геттером и сеттером из vuex
  const computedFabric = (names) => {
    const computed = {};
    names.map((name) => {
      computed[name] = {
        get() {
          return store.state[name];
        },
        set(val) {
          store.commit(name, val);
        },
      };
    });
    return computed;
  };

  const result = await axios.get('config.json');
  const config = result.data;

  const router = new VueRouter({mode: 'history'});
  const persistentFields = ['params', 'stlUrl', 'stlParams', 'stlMeta', 'gridSize', 'lang'];
  const computedFields = ['modelName', 's'];

  const store = new Vuex.Store({
    plugins: [
      createPersistedState({
        paths: persistentFields,
      }),
    ],
    state: {
      params: {},
      modelName: '',
      stlUrl: '',
      stlParams: {},
      gridSize: 31,
      lang: ['ru', 'ru-RU'].includes(window.navigator.language) ? 'ru' : 'en',
      s: {
        step1: '1. Select model',
        step1_ru: '1. Найдите модель',
        step2: '2. Customize',
        step2_ru: '2. Настройте',
        step3: '3. Get STL',
        step3_ru: '3. Скачайте модель',
        generate_stl: 'Generate STL',
        generate_stl_ru: 'Создать STL',
        stl_print: 'STL - print it',
        stl_print_ru: 'STL - на печать',
        scad_edit: 'SCAD - edit in OpenSCAD',
        scad_edit_ru: 'SCAD - для OpenSCAD',
        link: 'Link',
        link_ru: 'Ссылка',
        about: 'I often print same base models, just change sizes.<br/> This service created for speedup STL generate.',
        about_ru: 'Я часто печатаю одни и те же базовые модели, только меняю размеры в модели.<br/> Этот сайт нужен, чтобы ускорить создание таких моделей.',
        model: 'Model',
        model_ru: 'Модель',
      }
    },
    mutations: {
      ...mutationFabric([...persistentFields, ...computedFields]),
    },
  });

  const app = new Vue({
    router,
    store,
    components: {},
    el: '#app',

    data() {
      return {
        statusText: '',
        errorText: '',
        name: '', // название модели
        positionZ: 0,
        dialogVisible: false,
      }
    },

    watch: {
      modelName(val) {
        this.params.model = val;
      },
      name(val) {
        this.params.name = val;
      },
      stlUrl() {
        this.positionZ = 0; // reset before new model load, for correct center
      }
    },

    computed: {
      ...computedFabric([...persistentFields, ...computedFields]),
      modelOptions() {
        return config.models.map(el => {
          return {
            value: el.name,
            label: this.t(el, 'label') || el.name,
          }
        });
      },

      isProcess() {
        return this.statusText !== '';
      },

      // true when generated model match form params
      isParamsGenerated() {
        let match = true;
        for (let name in this.stlParams) {
          if (this.params[name] !== this.stlParams[name]) match = false;
        }
        return match;
      },

      model() {
        return config.models.find(el => el.name === this.modelName);
      },

      modelWidth() {
        return Math.min(window?.innerWidth - 16 || 800, 1440);
      },
      modelHeight() {
        return window?.innerHeight * 0.62;
      },

      presets() {
        return this.model?.presets;
      },

      paramsInputs() {
        return this.model?.params;
      },

      currentUrl() {
        return this.$route.fullPath;
      },

      downloadUrl() {
        const esc = encodeURIComponent;
        const query = Object.keys(this.stlParams)
          .map(k => esc(k) + '=' + esc(this.stlParams[k]))
          .join('&');
        return '/api/downloadStl?' + query;
      },

      metaInfo() {
        if (!this.stlMeta?.box) return '';
        const parts = [
          this.stlMeta.box.join('mm x ') + 'mm',
          Math.round(this.stlMeta.weight) + 'gm',
        ]
        return parts.join(', ');
      }
    },

    mounted() {
      this.setParamsFromUrl();
      if (!this.params.model) this.params.model = this.modelName; // TODO: possible it never happens
      if (!this.modelName) this.modelName = this.params.model;
      setTimeout(this.saveStl, 100);
    },

    methods: {
      t(el, field) {
        const langField = `${field}_${this.lang}`;
        if (el[langField]) return el[langField];
        return el[field];
      },

      async saveStl() {
        this.params = {...this.params, name: this.name};
        if (!this.params.model) return;
        this.setUrlFromParams();

        this.statusText = 'Generating SCAD -> STL...';
        const answer = await axios.post('/api/getStl', this.params);
        this.statusText = '';

        if (!answer.data) return;

        if (answer.data.error) {
          console.error(answer.data.error);
          this.errorText = answer.data.error;
          return;
        }

        if (!answer.data.stlPath) return;

        this.stlParams = {...this.params};
        this.stlMeta = answer.data;
        this.stlUrl = answer.data.stlPath + '?mt=' + Date.now();
      },

      setUrlFromParams() {
        const mParams = this.model?.params;

        const query = {};
        let isChanged = false;
        for (let name in this.params) {
          // only "model" and model params
          if (name !== 'model' && !mParams.find(el => el.name === name)) continue; // skip as not affected model

          if (this.params[name] !== this.$route.query[name]) isChanged = true; // check for changes
          query[name] = this.params[name];
        }

        if (isChanged) this.$router.push({ path: '/', query });
      },

      setParamsFromUrl() {
        for (let name in this.$route.query) {
          this.params[name] = this.$route.query[name];
          if (name === 'model') this.modelName = this.params[name];
        }
      },

      onStlLoad() {
        for(let stl of [this.$refs.stl, this.$refs.stlMobile]) {
          stl.scene.add(new THREE.GridHelper(155, this.gridSize)); // 155 = 1cm, 31x31cm = FlyingBear Reborn
          stl.scene.add(new THREE.AxesHelper(77.5)); // 155 / 2 ??

          // fix center position
          const util_box = new THREE.Box3();
          util_box.setFromObject(stl.wrapper);
          const center = util_box.getCenter(new THREE.Vector3());
          this.positionZ = center.z * -1;
        }
      },

      setPreset(p) {
        this.name = this.t(p, 'name');
        for (let name in p.params) {
          this.params[name] = p.params[name];
        }
        this.saveStl();
      },
    }
  });
}

window.onload = start;
