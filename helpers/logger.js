var winston = require('winston');
var config = require('config');

var logger = new (winston.Logger)({
  transports: [
    new (require('winston-daily-rotate-file'))({ // normal size rotation
      level: config.logLevel,
      handleExceptions: true,
      json: false,
      maxsize: 5242880, //5MB
      maxFiles: 20,
      colorize: false,
      filename: './api.log'
    }),
    new winston.transports.Console({
      level: config.logLevel,
      handleExceptions: true,
      timestamp: true,
      json: false,
      colorize: true
    })
  ]
});

module.exports = logger;
