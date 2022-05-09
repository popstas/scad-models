const modules = require('./modules');

for (let name in modules) {
  module.exports[name] = modules[name].generator;
}
