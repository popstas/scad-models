import { strict as assert } from 'assert';
import { getCacheKey } from '../src/index.js';

describe('getCacheKey', () => {
  it('sorts params alphabetically and prefixes with model', () => {
    const params = { model: 'cap', wall: 1, height: 2 };
    const key = getCacheKey(params);
    assert.equal(key, 'cap-height=2,wall=1');
  });
});
