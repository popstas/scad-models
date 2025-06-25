import { strict as assert } from 'assert';
import { getFilename } from '../dist/index.js';

describe('getFilename', () => {
  it('generates predictable filename with sanitized params and date', () => {
    const orig = Date.prototype.toISOString;
    Date.prototype.toISOString = () => '2022-01-01T01:02:03.000Z';
    const result = getFilename({ model: 'cap', wall: 1, height: 2, name: 'demo' });
    Date.prototype.toISOString = orig;
    assert.equal(result, 'cap-2022-01-01_01_02_03-h2,wall1-demo');
  });
});
