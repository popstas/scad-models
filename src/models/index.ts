// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = {};

function loadPresets(modelName) {
  const result = [];
  const builtinDir = path.join(__dirname, 'presets', modelName);
  const userDir = path.resolve('data/user-presets', modelName);
  [builtinDir, userDir].forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      try {
        const data = JSON.parse(fs.readFileSync(path.join(dir, file)));
        result.push(data);
      } catch (e) {
        console.error('Failed to load preset', file, e);
      }
    }
  });
  return result;
}

// Read all files in the current directory
const files = fs.readdirSync(__dirname);

// Dynamically import all .js files except index.js
for (const file of files) {
  if (file === 'index.js' || !file.endsWith('.js')) continue;

  try {
    const moduleName = file.replace(/\.js$/, '');
    const modulePath = `./${file}`;
    const module = await import(modulePath);
    models[moduleName] = { ...module.default, presets: [] };
  } catch (error) {
    console.error(`Error loading model ${file}:`, error);
  }
}

for (const name in models) {
  models[name].presets = loadPresets(name);
}

export { loadPresets };
export default models;
