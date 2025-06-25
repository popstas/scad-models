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
