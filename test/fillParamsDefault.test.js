import { strict as assert } from 'assert';
import { fillParamsDefault } from '../dist/index.js';

// defaults defined in src/models/cap.ts

describe('fillParamsDefault', () => {
  it('applies defaults from model config', () => {
    const params = { model: 'cap', wall: 2 };
    const result = fillParamsDefault({ ...params });
    assert.equal(result.height, 5);
    assert.equal(result.lid_height, 0.8);
    assert.equal(result.wall, 2); // existing value preserved
  });
});
