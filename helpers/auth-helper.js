var _ = require('lodash');
var jwt = require('jsonwebtoken');
var config = require('config');
var errorHelper = require('./error-helper');

/**
 * Auth check middleware generator
 * @param permissions permitted user roles
 * @returns Express.js middleware
 */
exports.checkAuth = function (permissions) {
  return function (req, res, next) {
    if (!req.user) {
      return errorHelper.handleError(res, 'Authentication Required', 401);
    }

    // Reset token & cookie to reset expiration. This makes the token expire in x hours of user inactivity.
    // possible only when using JWT cookie
    // var token = exports.generateToken(exports.serializeUser(req.user));
    // exports.setTokenCookie(res, token);

    if (!permissions) {
      return next();
    }

    if (!Array.isArray(permissions)) {
      permissions = [permissions];
    }

    if (!permissions.length) {
      return next();
    }

    if (!Array.isArray(req.user.roles) || !req.user.roles.length) {
      return errorHelper.handleError(res, 'Insufficient Permissions', 403);
    }

    var allowed = permissions.some(function(perm) {
      return req.user.roles.indexOf(perm) > -1;
    });

    if (!allowed) {
      return errorHelper.handleError(res, 'Insufficient Permissions', 403);
    }

    return next();
  };
};

/**
 * Remove sensitive fields from user document object
 * @param user document object
 * @returns user object serialized
 */
exports.serializeUser = function (user) {
  var userData = _.pick(user, ['username']);

  userData._id = String(user._id);

  return userData;
};

exports.generateToken = function (user) {
  return jwt.sign(
    user,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

exports.setTokenCookie = function (res, token) {
  res.cookie(config.jwt.cookieName, token, {
    expires: new Date(Date.now() + config.jwt.expiresIn * 1000),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: process.env.NODE_ENV === 'production',
  });
};

// TODO: remove when publishing to live
exports.devUser = function (role) {
  return {
    "_id" : "59031d99d3b29a5e08385ff5",
    "username" : "YouchiAdmin"
  };
};
