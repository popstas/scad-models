import { strict as assert } from 'assert';
import { fillParamsDefault, isParamsValid } from '../dist/index.js';

describe('isParamsValid', () => {
  it('returns true when all params provided', () => {
    const params = fillParamsDefault({ model: 'cap', wall: 1 });
    assert.ok(isParamsValid(params));
  });

  it('returns false when a param is empty', () => {
    const params = fillParamsDefault({ model: 'cap', wall: 1 });
    params.height = '';
    assert.equal(isParamsValid(params), false);
  });
});

