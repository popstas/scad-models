// @ts-nocheck
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ModelDefinition, Preset } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models: Record<string, ModelDefinition> = {};

function loadPresets(modelName: string): Preset[] {
  const result: Preset[] = [];
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

// Dynamically import all .ts files except index.ts
for (const file of files) {
  if (file === 'index.ts' || file === 'index.js' || (!file.endsWith('.ts') && !file.endsWith('.js'))) continue;

  try {
    const moduleName = file.replace(/\.(ts|js)$/, '');
    // Use .js extension in import path (TypeScript convention - tsx will resolve .ts files)
    const modulePath = `./${moduleName}.js`;
    const module = await import(modulePath);
    models[moduleName] = { ...(module as any).default, presets: [] };
  } catch (error) {
    console.error(`Error loading model ${file}:`, error);
  }
}

for (const name in models) {
  models[name].presets = loadPresets(name);
}

export { loadPresets };
export default models;
