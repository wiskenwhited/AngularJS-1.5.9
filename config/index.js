var _ = require('lodash');
var chalk = require('chalk');
var defaultConfig = require('./env/default');
var prodConfig = require('./env/production');
var devConfig = require('./env/development');

var loadConfig = function() {
  var envConfig;
  switch (process.env.NODE_ENV) {
    case 'production':
      envConfig = prodConfig; break;
    case 'development':
      envConfig = devConfig; break;
    default:
      console.warn(chalk.yellow('+ WARN: Unknown environment setting - ' + process.env.NODE_ENV +
        '? Using development environment instead.')); 
      envConfig = devConfig;
  }
  return _.merge(defaultConfig, envConfig);
};

module.exports = loadConfig();
