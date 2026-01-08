import fs from 'fs';
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import { exec, execSync } from 'child_process';
import config from '../config.js';
import models, { loadPresets } from './models/index.js';
import type { ModelDefinition, Preset, Config, StlInfo, Kit, KitArchive } from './types.js';
import NodeStl from 'node-stl';
import AdmZip from 'adm-zip';
import { fileURLToPath } from 'url';

console.log('config:', config);
export function start(): express.Express {
  fs.mkdirSync(config.cachePath, { recursive: true });
  return initExpress();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  start();
}

function getModelConfig(name: string): ModelDefinition | undefined {
  return models[name];
}

function reloadPresets() {
  for (const name in models) {
    models[name].presets = loadPresets(name);
  }
}

function getStlFromScad(pathScad) {
  const pathStl = pathScad.replace(/\.scad$/, '.stl');
  if (!fs.existsSync(pathStl) || !config.cache_enabled) {
    try {
      execSync(`openscad "${pathScad}" -o "${pathStl}"`);
      console.log(`Saved to ${pathStl}`);
    } catch (e) {
      console.log('error while convert SCAD to STL:');
      console.log('e.stderr:', e.stderr);
      return false;
    }
  } else {
    console.log('Use cached STL');
  }
  return pathStl;
}

function get3mfFromScad(pathScad) {
  const path3mf = pathScad.replace(/\.scad$/, '.3mf');
  if (!fs.existsSync(path3mf) || !config.cache_enabled) {
    try {
      execSync(`openscad "${pathScad}" -o "${path3mf}"`);
      console.log(`Saved to ${path3mf}`);
    } catch (e) {
      console.log('error while convert SCAD to 3MF:');
      console.log('e.stderr:', e.stderr);
      return false;
    }
  } else {
    console.log('Use cached 3MF');
  }
  return path3mf;
}

function buildPngFromScad(pathScad) {
  const pathPng = pathScad.replace(/\.scad$/, '.png');
  if (fs.existsSync(pathPng) && config.cache_enabled) {
    console.log('png cached:', pathPng);
    return pathPng;
  }

  const args = [
    'xvfb-run -a openscad',
    '--imgsize 300,300 --render 100',
    `"${pathScad}" -o "${pathPng}"`,
  ];
  const cmd = args.join(' ');

  console.log('generate png...');
  // console.log("cmd:", cmd);
  exec(cmd, (err, stdout, stderr) => {
    if (!err) console.log(`Saved to ${pathPng}`);
    else {
      console.log('err:', err);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
    }
  });
  return pathPng;
}

function initExpress(): express.Express {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use('/', express.static('public'));

  app.use('/models', express.static('data'));

  // config.json
  app.get('/config.json', (_req, res) => {
    res.json(getFrontConfig());
  });

  app.post('/api/getStl', async (req, res) => {
    const params = req.body;
    const noCache =
      params.cache !== undefined &&
      ['0', 'false', false].includes(params.cache);
    const currentCache = config.cache_enabled;

    if (noCache) {
      config.cache_enabled = false;
      console.log('noCache');
    }
    const stlData = getStl(params);
    if (noCache) config.cache_enabled = currentCache;

    res.json(stlData);
  });

  app.post('/api/get3mf', async (req, res) => {
    const params = req.body;
    const noCache =
      params.cache !== undefined &&
      ['0', 'false', false].includes(params.cache);
    const currentCache = config.cache_enabled;

    if (noCache) {
      config.cache_enabled = false;
      console.log('noCache');
    }
    const threeMfData = get3mf(params);
    if (noCache) config.cache_enabled = currentCache;

    res.json(threeMfData);
  });

  app.post('/api/savePreset', (req, res) => {
    const { model, name, params } = req.body;
    if (!model || !name || !params) {
      res.status(400).json({ error: 'Invalid params' });
      return;
    }
    const presetNameSafe = sanitizePresetName(name);
    const dir = `data/user-presets/${model}`;
    fs.mkdirSync(dir, { recursive: true });
    const presetPath = `${dir}/${presetNameSafe}.json`;
    fs.writeFileSync(presetPath, JSON.stringify({ name, params }, null, 2));
    res.json({ ok: true });
    reloadPresets();
  });

  app.get('/download/:filename', (req, res) => {
    // If no query params, try to find file in cache by exact filename match
    if (Object.keys(req.query).length === 0) {
      const requestedFilename = req.params.filename;
      // Filename should match cache file basename: model-param1=value1--param2=value2...stl
      const cacheDir = config.cachePath;
      if (fs.existsSync(cacheDir)) {
        // Check if file exists in cache with exact name match
        const pathFile = path.join(cacheDir, requestedFilename);
        if (fs.existsSync(pathFile)) {
          console.log(`Found cached file: ${requestedFilename}`);
          resSendFile(res, pathFile, requestedFilename);
          return;
        }
        console.log(`File not found in cache: ${requestedFilename}`);
      }
      // Return 404 if file not found in cache
      res.status(404).end('File not found. Please use URL with query parameters to generate the file.');
      return;
    }
    
    // Normal flow with query params
    const pathScad = saveScad(req.query as any);
    if (!pathScad || (pathScad as any)?.error) {
      res.status(404).end('404');
      return;
    }
    
    // Determine file type from filename extension
    const requestedFilename = req.params.filename;
    const is3mf = requestedFilename.endsWith('.3mf');
    const pathFile = is3mf ? get3mfFromScad(pathScad) : getStlFromScad(pathScad);
    const extension = is3mf ? '.3mf' : '.stl';
    const filename = getFilename(req.query) + extension;
    resSendFile(res, pathFile, filename);
  });

  app.get('/api/downloadkit', async (req, res) => {
    const kitName = req.query.name as string;
    const kitData = getKit(kitName);
    if ((kitData as any).error) {
      res.json(kitData);
      return;
    }

    resSendFile(res, (kitData as any).path, (kitData as any).filename);
  });

  app.listen(config.port, () => {
    console.log(`listen port ${config.port}`);
  });
  return app;
}

export function isParamsValid(params: Record<string, any>): boolean {
  const mParams = getModelConfig(params.model)?.params;
  if (!mParams) return false;
  for (const p of mParams) {
    if (['', undefined].includes(params[p.name])) {
      console.log(`params.${p.name} not valid`);
      return false;
    }
  }
  return true;
}

export function getFrontConfig(): { models: Omit<ModelDefinition, 'generator'>[]; kits: Kit[] } {
  const conf: { models: Omit<ModelDefinition, 'generator'>[]; kits: Kit[] } = {
    models: [],
    kits: [],
  };
  console.log('models:', models);
  for (const name in models) {
    const m = { ...models[name] };
    delete m.generator;
    conf.models.push(m);

    for (const p of m.presets) {
      const pathScad = getScadPath({ model: m.name, ...p.params });
      const pathPng = pathScad.replace(/\.scad$/, '.png');
      p.image = pathPng.replace('./data', 'models');
    }
  }
  conf.kits = config.kits || [];
  console.log('conf:', conf);
  return conf;
}

// return stl data, create scad and stl from params if not exists
function getStl(params: Record<string, any>): StlInfo | { error: string } {
  const pathScad = saveScad(params);
  if (!pathScad || (pathScad as any)?.error) {
    return { error: 'Failed: ' + (pathScad as any)?.error };
  }

  const pathPng = buildPngFromScad(pathScad as string);
  const pathStl = getStlFromScad(pathScad as string);

  if (!pathStl) {
    return { error: 'Failed to convert SCAD to STL' };
  }

  const stlPath = pathStl.replace('./data', 'models');
  const stl = new NodeStl(pathStl, { density: config.material.density });

  return {
    stlPath,
    image: pathPng,
    volume: stl.volume,
    weight: stl.weight,
    box: stl.boundingBox,
  };
}

// return 3mf data, create scad and 3mf from params if not exists
function get3mf(params: Record<string, any>): { threeMfPath: string; image: string } | { error: string } {
  const pathScad = saveScad(params);
  if (!pathScad || (pathScad as any)?.error) {
    return { error: 'Failed: ' + (pathScad as any)?.error };
  }

  const pathPng = buildPngFromScad(pathScad as string);
  const path3mf = get3mfFromScad(pathScad as string);

  if (!path3mf) {
    return { error: 'Failed to convert SCAD to 3MF' };
  }

  const threeMfPath = path3mf.replace('./data', 'models');

  return {
    threeMfPath,
    image: pathPng,
  };
}

// create and return zip archive
function getKit(kitName: string): KitArchive | { error: string } {
  const kit = config.kits.find((el) => el.name === kitName);
  if (!kit) {
    return { error: `Kit not exists: ${kitName}` };
  }

  // cache
  const cacheDir = `${config.cachePath}/kits`;
  const kitFilename = `kit-${kitName}.zip`;
  const kitPath = `${cacheDir}/${kitFilename}`;

  // generate zip
  if (!fs.existsSync(kitPath)) {
    let isValid = true;

    // get presets
    const items = kit.items.map((item) => {
      const preset = models[item.model]?.presets?.find((m) => m.id === item.id);
      if (!preset) isValid = false;
      return { ...preset, model: item.model };
    });
    if (!isValid) {
      return { error: `Cannot find all models for kit ${kitName}` };
    }

    // Save to zip
    const zip = new AdmZip();
    for (const item of items) {
      const pathScad = saveScad({ ...item.params, model: item.model });
      if (!pathScad || (pathScad as any)?.error) {
        isValid = false;
        continue;
      }

      // add scad
      zip.addLocalFile(pathScad as string);

      // add stl
      const pathStl = getStlFromScad(pathScad as string);
      zip.addLocalFile(pathStl);

      // add zip
      const pathPng = buildPngFromScad(pathScad as string);
      if (fs.existsSync(pathPng)) {
        zip.addLocalFile(pathPng);
      }
    }
    zip.writeZip(kitPath);
  } else {
    console.log('Use cached kitPath:', kitPath);
  }

  return {
    path: kitPath,
    filename: kitFilename,
  };
}

function resSendFile(res: express.Response, filePath: string, filename: string): void {
  // Determine file type and ensure correct extension
  let safeFilename = filename;
  let contentType: string;
  
  if (filename.endsWith('.zip')) {
    contentType = 'application/zip';
    safeFilename = filename;
  } else if (filename.endsWith('.3mf')) {
    contentType = 'application/octet-stream';
    safeFilename = 'model.3mf';
  } else {
    // For STL files, ensure .stl extension
    safeFilename = filename.endsWith('.stl') ? filename : filename + '.stl';
    contentType = 'model/stl';
  }
  
  // Sanitize filename for HTTP headers - remove invalid characters
  // HTTP headers cannot contain: newlines, carriage returns, or control characters
  // Also remove quotes and backslashes which can break the header
  const sanitizedFilename = safeFilename
    .replace(/[\r\n]/g, '') // Remove newlines and carriage returns
    .replace(/[^\x20-\x7E]/g, '_') // Replace non-printable ASCII with underscore
    .replace(/["\\]/g, '_'); // Replace quotes and backslashes
  
  // RFC 5987: filename* uses percent-encoding
  // Format: filename*=charset'lang'value
  const encodedFilename = encodeURIComponent(sanitizedFilename);
  const contentDisposition = `attachment; filename="${sanitizedFilename}"; filename*=UTF-8''${encodedFilename}`;
  
  res.setHeader('Content-Disposition', contentDisposition);
  res.setHeader('Content-Type', contentType);

  res.sendFile(path.resolve(filePath));
}

export function fillParamsDefault(params: Record<string, any>): Record<string, any> {
  const mParams = getModelConfig(params.model)?.params;
  if (!mParams) return params;
  for (const p of mParams) {
    if (params[p.name] === undefined) {
      params[p.name] = p.default;
    }
  }
  return params;
}

function saveScad(params: Record<string, any>): string | { error: string } {
  console.log('params:', params);
  params = fillParamsDefault(params);
  console.log('params filled:', params);
  if (!isParamsValid(params)) {
    const msg = 'params not valid';
    console.log(msg);
    return { error: msg };
  }

  const generator = models[params.model].generator;
  if (!generator) {
    const msg = 'generator not found for model ' + params.model;
    console.log(msg);
    return { error: msg };
  }

  const cachedPath = getCacheModel(params);
  if (cachedPath) {
    console.log('cachedPath:', cachedPath);
    return cachedPath;
  }

  const filePath = getScadPath(params);

  console.log('Generate...');
  const output = generator(params);
  const rotated = output; //.rotate([180, 180, 0])

  // const date = new Date().toISOString().replace(/[:]/g, '_');
  // const name = sanitize(params.name) ? `__${sanitize(params.name)}` : '';
  // const filename = `${date}__${params.model}${name}.scad`;
  // const filePath = './data/' + filename;

  fs.writeFileSync(filePath, rotated.serialize({ $fn: 100 }));
  console.log('Saved to ' + filePath);
  return filePath;
}

export function getCacheKey(params: Record<string, any>): string {
  const parts = [];
  const mParams = getModelConfig(params.model)?.params;

  for (const name in params) {
    // if (name === 'name') continue; // skip as not affected model
    // if (name === 'model') continue; // skip as not affected model
    if (!mParams.find((el) => el.name === name)) continue; // skip as not affected model

    parts.push({ name, value: params[name] });
  }

  parts.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });

  const paramsQuery = parts
    .map((p) => `${p.name}=${encodeURIComponent(p.value)}`)
    .join(',');
  const key = `${params.model}-${paramsQuery}`.substring(0, 250).replace(/,/g, '--');
  return key;
}

export function getFilename(params: Record<string, any>): string {
  // const h = new Date().getHours();
  // const m = new Date().getMinutes();
  // const date = Y-m-d_h-i
  const date = new Date()
    .toISOString()
    .replace(/[:]/g, '_')
    .replace(/T/, '_')
    .replace(/\..+/, '');
  let filename = getCacheKey(params)
    .replace('-', `-${date}-`)
    .replace(/=/g, '')
    .replace(/,/g, '--')
    .replace(/part/g, 'p')
    .replace(/inner/g, 'in')
    .replace(/height/g, 'h')
    .replace(/top/g, 't')
    .replace(/bottom/g, 'b')
    .replace(/left/g, 'l')
    .replace(/right/g, 'r')
    .replace(/diam/g, 'd');
  if (params.name) filename += `-${params.name}`;
  return filename;
}

export function getScadPath(params: Record<string, any>): string {
  const key = getCacheKey(params);
  return `${config.cachePath}/${key}.scad`;
}

function getCacheModel(params: Record<string, any>): string | false | undefined {
  if (!config.cache_enabled) return false;
  const filePath = getScadPath(params);
  if (fs.existsSync(filePath)) {
    return filePath;
  }
}

export function sanitizePresetName(name: string): string {
  return name.replace(/[^A-Za-z0-9\- ()]+/g, '').trim();
}
