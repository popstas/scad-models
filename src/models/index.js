import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = {};

// Read all files in the current directory
const files = fs.readdirSync(__dirname);

// Dynamically import all .js files except index.js
for (const file of files) {
  if (file === 'index.js' || !file.endsWith('.js')) continue;
  
  try {
    const moduleName = file.replace(/\.js$/, '');
    const modulePath = `./${file}`;
    const module = await import(modulePath);
    models[moduleName] = module.default;
  } catch (error) {
    console.error(`Error loading model ${file}:`, error);
  }
}

export default models;
