import { strict as assert } from 'assert';
import { getScadPath } from '../src/index.js';

describe('getScadPath', () => {
  it('returns path based on cache directory and params key', () => {
    const result = getScadPath({ model: 'cap', wall: 1, height: 2 });
    assert.equal(result, './data/cache/cap-height=2,wall=1.scad');
  });
});
