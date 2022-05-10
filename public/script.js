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
        kit: 'Kit',
        kit_ru: 'Набор',
        or_select_kit: 'Or select Kit:',
        or_select_kit_ru: 'Или выберите набор:',
        scheme: 'Scheme',
        scheme_ru: 'Чертёж',
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
        kitName: '',
        modelWidth: 0,
        modelHeight: 0,
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
      previewImg() {
        return this.model?.preview;
      },

      presets() {
        return this.model?.presets;
      },

      kits() {
        return config.kits;
      },

      kit() {
        const kit = config.kits.find(el => el.name === this.kitName);
        if (!kit) return;
        const items = kit.items.map(item => {
          const model = config.models.find(el => el.name === item.model);
          const preset = model?.presets?.find(m => m.id === item.id);
          preset.name = this.modelOptions.find(m => m.value === item.model)?.label + ': ' + this.t(preset, 'name')
          if (!preset) isValid = false;
          preset.params.model = item.model;
          return {...preset, model: item.model};
        });
        return {...kit, items};
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

      downloadkitUrl() {
        const esc = encodeURIComponent;
        const params = { name: this.kitName };
        const query = Object.keys(params)
          .map(k => esc(k) + '=' + esc(params[k]))
          .join('&');
        return '/api/downloadkit?' + query;
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

    created() {
      this.updateSizes();
    },

    mounted() {
      this.setParamsFromUrl();
      if (!this.params.model) this.params.model = this.modelName; // TODO: possible it never happens
      if (!this.modelName) this.modelName = this.params.model;
      this.updateSizes();

      window.addEventListener("scroll", () => {
        this.updateSizes();
      }, { passive: true });

      setTimeout(this.saveStl, 100);
    },

    methods: {
      t(el, field) {
        const langField = `${field}_${this.lang}`;
        if (el[langField]) return el[langField];
        return el[field];
      },

      getModelWidth() {
        // Math.min(window?.innerWidth - 16 || 800, 1440)
        const span24 = Math.min(window?.innerWidth - 22, 1440);
        if (span24 < 720) return span24;
        return span24 * 2/3;
      },
      getModelHeight() {
        return window?.innerHeight * 0.8;
      },
      updateSizes() {
        this.modelWidth = this.getModelWidth();
        this.modelHeight = this.getModelHeight();
      },

      paramAbr(name) {
        let abr = name;
        const abrMap = {
          part: 'P',
          inner: 'In',
          height: 'H',
          diam: 'D',
          wall: 'W',
        };

        for (let fullName in abrMap) {
          const shortName = abrMap[fullName];
          const reg = new RegExp(fullName, 'g');
          abr = abr.replace(reg, shortName);
        }
        return abr;
      },

      async saveStl(params) {
        if (!params) params = this.params;
        params = {...params, name: this.name};
        this.params = params;
        if (params.model && params.model !== this.modelName) this.modelName = params.model;
        if (!params.model) params.model = this.modelName; // TODO: запутался, тут лишние проверки модели туда-сюда
        if (!params.model) return;
        this.setUrlFromParams();

        this.statusText = 'Generating SCAD -> STL...';
        const answer = await axios.post('/api/getStl', params);
        this.statusText = '';
        this.errorText = '';

        if (!answer.data) return;

        if (answer.data.error) {
          console.error(answer.data.error);
          this.errorText = answer.data.error;
          return;
        }

        if (!answer.data.stlPath) return;

        this.stlParams = {...params};
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
        this.saveStl(p.params);
      },
    }
  });
}

window.onload = start;
