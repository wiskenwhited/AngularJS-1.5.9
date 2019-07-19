var logger = require('./logger');

var errorHelper = exports = module.exports = {};

errorHelper.handleError = function (res, error, status) {

  var response = {};

  response.status = status || (error && error.status) || 500;

  if (error && typeof error === 'string') {
    response.message = error;
  } else if (error && error.message) {
    response.message = error.message;
  } else {
    response.message = 'Unknown Error';
  }

  if (error.code && (error.code === 11000 || error.code === 11001)) {
    response.message = getUniqueErrorMessage(error);
  }

  if (error && error.errors) {
    response.errorList = [];
    Object.keys(error.errors).forEach(function (key) {
      if (error.errors[key].message) {
        response.errorList.push(error.errors[key].message);
      }
    });
  }

  if (process.env.NODE_ENV !== 'production' && error && error.stack) {
    response.stack = error.stack;
  }

  response.status >= 500 && logger.error(error);

  return res.status(response.status).json(response);
};

function getUniqueErrorMessage (err) {
  var output;

  try {
    var endPos = err.errmsg.lastIndexOf('_1');
    var startPos = err.errmsg.lastIndexOf(' ', endPos);
    var fieldName = err.errmsg.substring(startPos + 1, endPos);
    output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

  } catch (ex) {
    output = 'Unique field already exists';
  }

  return output;
}