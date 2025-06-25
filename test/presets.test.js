import { strict as assert } from 'assert';
import fs from 'fs';
import { sanitizePresetName } from '../dist/index.js';
import { loadPresets } from '../dist/models/index.js';

describe('preset utils', () => {
  it('sanitizePresetName keeps allowed chars', () => {
    const name = 'Test 123-()!@#';
    assert.equal(sanitizePresetName(name), 'Test 123-()');
  });

  it('loadPresets reads builtin and user dirs', () => {
    const builtins = loadPresets('funnel');
    assert.ok(builtins.length > 0);

    const dir = 'data/user-presets/testmodel';
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dir + '/custom.json', JSON.stringify({ name: 'c', params: {} }));
    const user = loadPresets('testmodel');
    assert.equal(user.length, 1);
    fs.rmSync('data/user-presets', { recursive: true, force: true });
  });
});
