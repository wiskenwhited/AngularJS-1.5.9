if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

require('rootpath')();
var passport = require('passport');
var throng = require('throng');
var config = require('config');
var express = require('./core/express');
var chalk = require('chalk');
var logger = require('./helpers/logger');
var mysql = require('mysql');


var sql = mysql.createConnection({
  host:'127.0.0.1',
  user: 'root',
  password: ''
});

sql.connect(function(err){
  if (err) throw err;
  sql.query("CREATE DATABASE IF NOT EXISTS telecom;", function(err, result){
    if (err) throw err;
  });
})

/**
 * Start Express app
 */
function start(workerId, callback) {

  var app = express.init();

  // Start the app by listening on <port>
  app.listen(config.port, function () {

    // Logging initialization
    (!workerId || workerId === 1) && logger.info(chalk.green(
      "\n ------------------------------------------------------\r\n",
      "The server is running at " + config.host + "/\n",
      "Environment:\t\t" + process.env.NODE_ENV + "\n",
      "Port:\t\t\t" + config.port + "\n",
      "Database:\t\t" + config.db.connectionString + "\n",
      "------------------------------------------------------\n"));

    if (callback) callback(app, config);

  });

}

/**
 * Starting backend server with clusters
 * (No clustering on development)
 */
var webConcurrency = process.env.NODE_ENV === 'production' ? config.webConcurrency : 1;
throng({
  workers: webConcurrency,

  master: function() {
    logger.info(chalk.magenta('Master cluster started, setting up ' + webConcurrency + ' worker(s) ...'));
  },

  start: function(id) {
    logger.info(chalk.yellow('Worker #' + id + ' started'));
    start(id);

    process.on('SIGTERM', function () {
      logger.info(chalk.cyan('Worker ' + id + ' exiting ...'));
      process.exit();
    });
  }
});


