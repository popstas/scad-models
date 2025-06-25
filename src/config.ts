import rawConfig from '../config.js';
import type { Config } from './types.js';

// Cast configuration loaded from JavaScript file
const config: Config = rawConfig as Config;
export default config;
