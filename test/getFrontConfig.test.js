import { strict as assert } from 'assert';
import { getFrontConfig } from '../dist/index.js';

describe('getFrontConfig', () => {
  it('returns model configs without generator', () => {
    const conf = getFrontConfig();
    assert.ok(Array.isArray(conf.models));
    assert.ok(conf.models.length > 0);
    assert.ok(!('generator' in conf.models[0]));
  });

  it('includes kits from config', () => {
    const conf = getFrontConfig();
    assert.ok(Array.isArray(conf.kits));
  });
});

