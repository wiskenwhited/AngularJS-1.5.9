var _ = require('lodash');
var Q = require('q');
var sql = require('../mysql/db');
var dateTime = require('node-datetime');
var service = {};

service.getBalance = getBalance;
service.setBalance = setBalance;
service.rechargeHistory = rechargeHistory;
service.getUserInfo = getUserInfo;
service.getChargeHistory = getChargeHistory;
module.exports = service;


// Get balance of the current user
function getBalance(userID) {
    var deferred = Q.defer();
    var query = "SELECT * FROM user where id = ?";
    sql.query(query, [userID], function(err, result){ 
        if (err) {
            deferred.reject(err);   
        }
        if (result && result.length > 0) {
            var res = { balance: result[0]['balance'] };
            deferred.resolve(res);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
}

function getUserInfo(userID) {
    var deferred = Q.defer();
    var query = "SELECT * FROM user where id = ?";
    sql.query(query, [userID], function(err, result){ 
        if (err) {
            deferred.reject(err);   
        }
        if (result && result.length > 0) {
            var res = { email: result[0]['email'] , name: result[0]['name']};
            deferred.resolve(res);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
}

function getChargeHistory(userID) {
    var deferred = Q.defer();
    var query = "SELECT * FROM recharge_history where user_id = ?";
    sql.query(query, [userID], function(err, result){ 
        if (err) {
            deferred.reject(err);   
        }
        if (result && result.length > 0) {
            var response = [];
            for (let i=0; i<result.length; i++) {
                var data = {
                    payment_amount: result[i].payment_amount,
                    job_name: result[i].job_name,
                    prev_balance: result[i].prev_balance,
                    new_balance: result[i].new_balance,
                    date: result[i].date
                };
                response.push(data);
            }
            deferred.resolve(response);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
}

// Set balance of the current user
function setBalance(info) {
    var deferred = Q.defer();
    var query = "UPDATE user SET balance = ? WHERE id =" + sql.escape(info.userID);
    var match = [ parseFloat(info.balance) ];
    sql.query(query, match, function(err, result){ 
        if (err) {
            deferred.reject(err);   
        }
        if (result) {
            deferred.resolve(info.balance);
        } else {
            deferred.reject(err);
        }
    });
    return deferred.promise;
}

// Record the rechargeHistory
function rechargeHistory(pay, userID ) {
    var deferred = Q.defer();
    sql.query("SELECT * FROM dnc_sift WHERE id = " + sql.escape(pay.job_name), function(err, result) {
        if (err) {
            throw err;
            deferred.reject(err);
        }
        if (result && result.length > 0) {
            var job_name = result[0]['filename'];
            if (!userID) deferred.reject('Invalid user');
            var query = "INSERT INTO recharge_history (confirmation_id, payment_amount, job_name, date, user_id) VALUES ?";
            var dt = dateTime.create();
            var date = dt.format('Y-m-d H:M:S');
            var paymentHistory = [
                [ pay.confirmation_id.toString() , parseFloat(pay.payment_amount), job_name, date, parseInt(userID)  ]
            ];
            sql.query(query, [paymentHistory], function(err, result){ 
                if (err) {
                    throw err;
                    deferred.reject(err);   
                }
                if (result) {
                    deferred.resolve({record: true});
                } else {
                    deferred.reject(err);
                }
            });
        }   
     
    });
   
    return deferred.promise;
}




