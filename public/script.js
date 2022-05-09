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

  const router = new VueRouter();
  const persistentFields = ['params', 'modelName', 'stlUrl', 'gridSize'];

  const store = new Vuex.Store({
    plugins: [
      createPersistedState({
        paths: persistentFields,
      }),
    ],
    state: {
      params: {},
      modelName: 'funnel',
      stlUrl: 'models/last.stl',
      gridSize: 31,
    },
    mutations: {
      ...mutationFabric(persistentFields),
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
      stlUrl() {
        this.positionZ = 0; // reset before new model load, for correct center
      }
    },

    computed: {
      ...computedFabric(persistentFields),
      modelOptions() {
        return config.models.map(el => {
          return {
            value: el.name,
            label: el.label || el.name,
          }
        });
      },

      isProcess() {
        return this.statusText !== '';
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
        return '/#' + this.$route.fullPath;
      }
    },

    mounted() {
      this.setParamsFromUrl();
      if (!this.params.model) this.params.model = this.modelName;
      setTimeout(this.saveStl, 100);
    },

    methods: {
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

        this.stlUrl = answer.data.stlPath + '?mt=' + Date.now();
      },

      setUrlFromParams() {
        const mParams = this.model?.params;

        const query = {};
        for (let name in this.params) {
          // only "model" and model params
          if (name !== 'model' && !mParams.find(el => el.name === name)) continue; // skip as not affected model

          query[name] = this.params[name];
        }

        this.$router.push({ path: '/', query });
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
        this.name = p.name;
        for (let name in p.params) {
          this.params[name] = p.params[name];
        }
        this.saveStl();
      },
    }
  });
}

window.onload = start;
