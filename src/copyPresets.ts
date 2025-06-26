import { join } from 'path';
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'fs';

const mkdirp = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

const copyRecursiveSync = (src: string, dest: string) => {
  const exists = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    mkdirp(dest);
    readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(join(src, childItemName), join(dest, childItemName));
    });
  } else {
    copyFileSync(src, dest);
  }
};

// Main execution
const copyPresets = () => {
  try {
    // Use paths relative to the project root
    const src = join(process.cwd(), 'src', 'models', 'presets');
    const dest = join(process.cwd(), 'dist', 'models', 'presets');
    
    if (existsSync(src)) {
      console.log(`Copying presets from ${src} to ${dest}`);
      copyRecursiveSync(src, dest);
      console.log('Successfully copied presets to dist directory');
    } else {
      console.log('No presets directory found, skipping copy');
    }
  } catch (error) {
    console.error('Error copying files:', error);
    process.exit(1);
  }
};

// Execute the function when this file is run directly
copyPresets();

export default copyPresets;
