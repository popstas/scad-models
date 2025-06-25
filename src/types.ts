export interface ModelParam {
  label: string;
  label_ru: string;
  name: string;
  type: string;
  default: number | string;
}

export interface Preset {
  name: string;
  id?: string;
  params: Record<string, unknown>;
  [key: string]: any;
}

export interface ModelDefinition {
  generator: (params: Record<string, any>) => any;
  name: string;
  label: string;
  label_ru: string;
  preview: string;
  params: ModelParam[];
  presets?: Preset[];
}

export interface KitItem {
  model: string;
  id: string;
}

export interface Kit {
  name: string;
  name_ru: string;
  items: KitItem[];
}

export interface Config {
  cache_enabled: boolean;
  cachePath: string;
  material: {
    density: number;
  };
  port: number;
  kits: Kit[];
}

export interface StlInfo {
  stlPath: string;
  image: string;
  volume: number;
  weight: number;
  box: any;
}

export interface KitArchive {
  path: string;
  filename: string;
}
