const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const { execSync } = require('child_process');
const config = require('../config');
const models = require('./models');
const NodeStl = require('node-stl');
const AdmZip = require('adm-zip');

start();

function start() {
  initExpress();
}

function getModelConfig(name) {
  return models[name];
}

function getStlFromScad(pathScad) {
  const pathStl = pathScad.replace(/\.scad$/, '.stl');
  if (!fs.existsSync(pathStl) || !config.cache_enabled) {
    try {
      execSync(`openscad "${pathScad}" -o "${pathStl}"`);
      console.log(`Saved to ${pathStl}`);
    } catch(e) {
      console.log("error while convert SCAD to STL:");
      console.log("e.stderr:", e.stderr);
      return false;
    }
  } else {
    console.log("Use cached STL");
  }
  return pathStl;
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
    conf.kits = config.kits || [];
    res.json(conf);
  })

  app.get('/api/downloadStl', (req, res) => {
    const cachePath = getCacheModel(req.query);
    if (!cachePath) {
      res.end('404');
      return;
    }
    const stlPath = cachePath.replace(/\.scad$/, '.stl');

    const filename = getFilename(req.query) + '.stl';
    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(filename));
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Type', 'application/octet-stream');

    res.sendFile(path.resolve(stlPath))
  })

  app.use('/', express.static('public'));

  app.use('/models', express.static('data'));

  app.post('/api/getStl', async (req, res) => {
    const pathScad = saveModel(req.body);
    if (!pathScad || pathScad?.error) {
      res.json({ error: 'Failed: ' + pathScad?.error});
      return;
    }

    const pathStl = getStlFromScad(pathScad);

    if (!pathStl) {
      res.json({ error: 'Failed to convert SCAD to STL'});
      return;
    }

    const stlPath = pathStl.replace('./data', 'models');
    const stl = new NodeStl(pathStl, { density: config.material.density});

    res.json({
      stlPath,
      volume: stl.volume,
      weight : stl.weight,
      box : stl.boundingBox,
    });
  });

  app.get('/api/downloadkit', async (req, res) => {
    const kitName = req.query.name;
    const kit = config.kits.find(el => el.name === kitName);
    if (!kit) {
      res.end(404);
      return;
    }

    // cache
    const cacheDir = `${config.cachePath}/kits`;
    const kitFilename = `kit-${kitName}.zip`;
    const kitPath = `${cacheDir}/${kitFilename}`;

    // generate zip
    if (!fs.existsSync(kitPath)) {
      let isValid = true;
      const items = kit.items.map(item => {
        const preset = models[item.model]?.presets?.find(m => m.id === item.id);
        if (!preset) isValid = false;
        return {...preset, model: item.model};
      });
      if (!isValid) {
        console.log("cannot find all models for kit:", kitName);
        res.end(404);
        return;
      }

      // Save to zip
      const zip = new AdmZip();
      for (let item of items) {
        const pathScad = saveModel({...item.params, model: item.model});
        if (!pathScad || pathScad?.error) {
          isValid = false;
          continue;
        }

        const pathStl = getStlFromScad(pathScad);
        zip.addLocalFile(pathStl);
      }
      zip.writeZip(kitPath);
    } else {
      console.log("Use cached kitPath:", kitPath);
    }

    res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent(kitFilename));
    res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Type', 'application/octet-stream');

    res.sendFile(path.resolve(kitPath))
  });

  app.listen(config.port, () => { console.log(`listen port ${config.port}`); });
  return app;
}

function isParamsValid(params) {
  const mParams = getModelConfig(params.model)?.params;
  if (!mParams) return false;
  for (let p of mParams) {
    if (['', undefined].includes(params[p.name])) {
      console.log(`params.${p.name} not valid`);
      return false;
    }
  }
  return true;
}

function saveModel(params) {
  console.log("saveModel");
  if (!isParamsValid(params)) {
    const msg = 'params not valid';
    console.log(msg);
    return { error: msg };
  }

  console.log(params);
  const generator = models[params.model].generator;
  if (!generator) {
    const msg = 'generator not found for model ' + params.model;
    console.log(msg);
    return { error: msg };
  }

  const cachedPath = getCacheModel(params);
  if (cachedPath) {
    console.log("cachedPath:", cachedPath);
    return cachedPath;
  }

  const filePath = getModelPath(params);

  console.log("Generate...");
  const output = generator(params);
  const rotated = output;//.rotate([180, 180, 0])

  // const date = new Date().toISOString().replace(/[:]/g, '_');
  // const name = sanitize(params.name) ? `__${sanitize(params.name)}` : '';
  // const filename = `${date}__${params.model}${name}.scad`;
  // const filePath = './data/' + filename;

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

function getFilename(params) {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  let filename = getCacheKey(params)
    .replace('-', `-${h}${m}-`)
    .replace(/=/g, '')
    .replace(/part/g, 'p')
    .replace(/inner/g, 'in')
    .replace(/height/g, 'h')
    .replace(/diam/g, 'd')
  if (params.name) filename += `-${params.name}`;
  return filename;
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
