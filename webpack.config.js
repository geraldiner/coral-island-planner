const path = require('path');

module.exports = {
  mode: 'development',
  target: ['web', 'es5', 'es6'],
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'main.js',
  },
};
