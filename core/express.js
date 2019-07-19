var path = require('path');
var config = require('config');
var express = require('express');
var morgan = require('morgan');
var logger = require('./logger');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var cors = require('cors');
var compression = require('compression');
var fileUpload = require('express-fileupload');
var expressJwt = require('express-jwt');
var errorHelper = require('../helpers/error-helper');
var setupApiRoutes = require('../routes');
var authHelper = require('../helpers/auth-helper');
var passport = require('passport');
var pass = require('../config/passport')(passport);
var paypal = require('paypal-rest-sdk');
/**
 * Initialize local variables
 */
var initLocalVariables = function (app) {
  // Passing the request url to environment locals
  app.use(function (req, res, next) {
    res.locals.host = req.protocol + '://' + req.hostname;
    res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
    next();
  });
};

/**
 * Initialize application middleware
 */
var initMiddleware = function (app) {
  // Showing stack errors
  app.set('showStackError', true);
  // Gzip-compression
  app.use(compression());
  
  // Enable logger (morgan)
  app.use(morgan(logger.getFormat(), logger.getOptions()));

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  app.use(methodOverride());

  // Add the cookie parser
  app.use(cookieParser());

  // file upload
  app.use(fileUpload());

};

/**
 * Configure Express JWT
 */
var initJWT = function (app) {
  app.use(expressJwt({
    secret: config.jwt.secret,
    credentialsRequired: false,
    getToken: function fromHeaderOrQueryString (req) {
      if (req.cookies[config.jwt.cookieName]) {
        return req.cookies[config.jwt.cookieName];
      } else if (req.headers.authorization) {
        return req.headers.authorization;
      } else if (req.query && req.query.token) {
        return req.query.token;
      }

      // TODO: remove when publishing to live
      if (process.env.NODE_ENV !== 'production') {
        if (req.query.devtoken === 'HollywoodTelecomInc') {
          return authHelper.generateToken(authHelper.serializeUser(authHelper.devUser()));
        }
      }

      return null;
    }
  }));
};

/**
 * Configure Helmet headers configuration
 */
var initHelmetHeaders = function (app) {
  // Use helmet to secure Express headers
  var SIX_MONTHS = 15778476000;
  app.use(helmet.frameguard());
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.hsts({
  
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
  app.use(helmet.hidePoweredBy());
};

/**
 * Configure the server routes
 */
var initServerRoutes = function (app, passport) {

  // API routes
  setupApiRoutes(app, passport);

  // Route to serve uploaded files
  app.use('/upload', express.static(config.uploadPath));
};

/**
 * Setup middlewares and routes to serve client application
 */
var serveClientApp = function (app) {
  // serve static files for client app
  app.use(express.static(path.resolve('csvData')));
  app.use(express.static(path.resolve('views')));
  app.use(express.static(path.resolve(__dirname, '../client')));

  // serve index.html for client app page view request
  app.all('*', function (req, res, next) {
    var url = path.resolve(__dirname + '../client/index.html');
    res.sendFile(url);
  });
};

/**
 * global error handling
 */
var handleErrors = function (app) {
  app.use(function handleError(err, req, res, next) {
    if(err.code === 'ENOENT') { err.message = 'File not found'; }
    errorHelper.handleError(res, err, err.status || 500);
  });
}


/**
 * Initialize the Express application
 */
module.exports.init = function () {
  // Initialize express app
  var app = express();
  var passport = require('passport');
  var task = require('../controllers/cronJob.controller');
  task.start();
  
  // Initialize local variables
  initLocalVariables(app);

  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  
  // Initialize Express middleware
  initMiddleware(app);

  // Initialize Express JWT
  initJWT(app);

  // Initialize Helmet security headers
  initHelmetHeaders(app);

  // Initialize modules server routes
  initServerRoutes(app, passport);

  // Serve client application for development environment
  serveClientApp(app);

  // global error handling
  handleErrors(app);

  return app;
};
