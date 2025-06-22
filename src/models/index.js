const normalizedPath = require('path').join(__dirname, '.');

require('fs')
  .readdirSync(normalizedPath)
  .forEach(function (file) {
    const moduleName = file.split('.')[0];
    if (file !== 'index.js' && !file.startsWith('_')) exports[moduleName] = require('./' + file);
  });
