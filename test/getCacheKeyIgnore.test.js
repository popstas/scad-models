import { strict as assert } from 'assert';
import { getCacheKey } from '../dist/index.js';

describe('getCacheKey ignore unknown params', () => {
  it('ignores params not defined in model config', () => {
    const params = { model: 'cap', wall: 1, height: 2, unknown: 5 };
    const key = getCacheKey(params);
    assert.equal(key, 'cap-height=2,wall=1');
  });
});
