const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const { execSync } = require('child_process');
const config = require('../config');
const models = require('./models');

start();

function start() {
  initExpress();
}

function getModelConfig(name) {
  return models[name];
}

function initExpress() {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // config.json
  app.get('/config.json', (_req, res) => {
    // const conf = {...config};
    const conf = {models: []};
    for (let name in models) {
      const m = {...models[name]};
      delete(m.generator);
      conf.models.push(m);
    }
    res.json(conf);
  })

  app.use('/', express.static('public'));

  app.use('/models', express.static('data'));

  app.post('/api/getStl', async (req, res) => {
    const pathScad = saveModel(req.body);
    if (!pathScad) {
      res.json({ error: 'Failed to save SCAD model'});
      return;
    }

    const pathStl = pathScad.replace(/\.scad$/, '.stl');
    if (!fs.existsSync(pathStl) || !config.cache_enabled) {
      try {
        execSync(`openscad "${pathScad}" -o "${pathStl}"`);
        console.log(`Saved to ${pathStl}`);
      } catch(e) {
        console.log("error while convert SCAD to STL:");
        console.log("e.stderr:", e.stderr);
      }
    } else {
      console.log("Use cached STL");
    }

    const stlPath = pathStl.replace('./data', 'models');
    res.json({stlPath});
  });

  app.listen(config.port, () => { console.log(`listen port ${config.port}`); });
  return app;
}

function isParamsValid(params) {
  const mParams = getModelConfig(params.model)?.params;
  if (!mParams) return false;
  for (let p of mParams) {
    if (['', undefined].includes(params[p.name])) return false;
  }
  return true;
}

function saveModel(params) {
  console.log("saveModel");
  if (!isParamsValid(params)) {
    console.log('params not valid, ignore');
    return;
  }

  console.log(params);
  const generator = models[params.model].generator;
  if (!generator) {
    console.log('generator not found for model ' + params.model);
    return;
  }

  const cachedPath = getCacheModel(params);
  if (cachedPath) {
    console.log("cachedPath:", cachedPath);
    return cachedPath;
  }

  console.log("Generate...");
  const output = generator(params);
  const rotated = output;//.rotate([180, 180, 0])

  // const date = new Date().toISOString().replace(/[:]/g, '_');
  // const name = sanitize(params.name) ? `__${sanitize(params.name)}` : '';
  // const filename = `${date}__${params.model}${name}.scad`;
  // const filePath = './data/' + filename;

  const filePath = getModelPath(params);

  fs.writeFileSync(filePath, rotated.serialize({ $fn: 100 }));
  console.log("Saved to " + filePath);
  return filePath;
}

function getCacheKey(params) {
  const parts = [];
  const mParams = getModelConfig(params.model)?.params;

  for (let name in params) {
    // if (name === 'name') continue; // skip as not affected model
    // if (name === 'model') continue; // skip as not affected model
    if (!mParams.find(el => el.name === name)) continue; // skip as not affected model

    parts.push({ name, value: params[name] });
  }

  parts.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });

  const paramsQuery = parts.map(p => `${p.name}=${encodeURIComponent(p.value)}`).join(',');
  const key = `${params.model}-${paramsQuery}`.substring(0, 250);
  return key;
}

function getModelPath(params) {
  const key = getCacheKey(params);
  return `${config.cachePath}/${key}.scad`;
}

function getCacheModel(params) {
  if(!config.cache_enabled) return false;
  const filePath = getModelPath(params);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
}
