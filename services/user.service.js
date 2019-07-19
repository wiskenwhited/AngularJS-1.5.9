var config = require('config');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');
var Q = require('q');
var sql = require('../mysql/db');
var localStorage = require('localStorage');

sql.connect(function(err) {
    if (err) throw err;
    console.log("connecting with database...");
    var loginTbl 		= "CREATE TABLE IF NOT EXISTS loginattempt( id int(10) NOT NULL AUTO_INCREMENT,  name varchar(50) DEFAULT NULL, email varchar(50) DEFAULT NULL, password varchar(50) DEFAULT NULL, promo_code varchar(20) DEFAULT NULL, user_type varchar(50) DEFAULT NULL, PRIMARY KEY(id))ENGINE=InnoDB DEFAULT CHARSET=utf8;";
    var userTbl 		= "CREATE TABLE IF NOT EXISTS user( id int(10) NOT NULL AUTO_INCREMENT, name varchar(50) DEFAULT NULL, email varchar(50) DEFAULT NULL, password varchar(50) DEFAULT NULL, photo TEXT, user_type varchar(50) DEFAULT NULL, promo_code varchar(20) DEFAULT NULL, auth_type varchar(20) DEFAULT NULL, token varchar(200) DEFAULT NULL, mail_id varchar(200) DEFAULT NULL, balance decimal(10, 4) DEFAULT 0.0000, created_date timestamp NULL , enabled tinyint(2) DEFAULT 0,  PRIMARY KEY(id))ENGINE=InnoDB DEFAULT CHARSET=utf8;";	
    var dncSift 		= "CREATE TABLE IF NOT EXISTS dnc_sift( id int(10) NOT NULL AUTO_INCREMENT, filename varchar(50) DEFAULT NULL,dnc int(10) DEFAULT NULL, gold float(10) DEFAULT NULL, total int(10) DEFAULT NULL, progress int(5) DEFAULT NULL, cost_matches decimal(10, 4), cost_dips decimal(10, 4),  total_cost decimal(10, 4), real_filename varchar(100) DEFAULT NULL, file_path varchar(100) DEFAULT NULL, status enum('stopped', 'running', 'finished') DEFAULT NULL, created_date timestamp NULL, finished_date timestamp NULL, payment_status boolean not null DEFAULT 0, download_status boolean not null DEFAULT 0, user_id int(10) DEFAULT NULL, PRIMARY KEY(id))ENGINE=InnoDB DEFAULT CHARSET=utf8;";
	var rechargeHistroy = "CREATE TABLE IF NOT EXISTS recharge_history( id int(10) NOT NULL AUTO_INCREMENT, confirmation_id varchar(200) DEFAULT NULL,payment_amount decimal(10, 4),job_name varchar(50) DEFAULT NULL, prev_balance decimal(10, 4) , new_balance decimal(10, 4) , date timestamp DEFAULT CURRENT_TIMESTAMP, user_id int(10) DEFAULT NULL, PRIMARY KEY(id))ENGINE=InnoDB DEFAULT CHARSET=utf8;";
	var dnc 			= "CREATE TABLE IF NOT EXISTS dnc(dnc bigint(10) NOT NULL, PRIMARY KEY(dnc))ENGINE=InnoDB DEFAULT CHARSET = utf8;"
    sql.query(loginTbl, function (err, result) {
        if (err) throw err;
    });
    sql.query(dncSift, function (err, result) {
        if (err) throw err;
    });
    sql.query(dnc, function (err, result) {
        if (err) throw err;
    });
    sql.query(rechargeHistroy, function (err, result) {
        if (err) throw err;
    });
    sql.query(userTbl, function (err, result) {
        if (err) throw err;
        console.log("Successfully connected with MySQL");
    });
});

var service = {};

service.authentication = authentication;
service.create = create;
service.emailConfirm = emailConfirm;
service.getBalance = getBalance;
service.getProfile = getProfile;
service.getToken = getToken;
service.savePhoto = savePhoto;
service.verify = verify;
service.delete = _delete;
service.match = match;
module.exports = service;


// temporary DB for email confirmation
function create(user, token) {
	var deferred = Q.defer();
		var query = "INSERT INTO loginattempt(name, email, password, user_type, promo_code) VALUES ?";
		
		var userinfo = [
			[ user.fullname, user.email, token, user.userType, user.promo_code ]
		];
		sql.query(query, [userinfo], function(err, result){ 
			console.log(err);
			if (err) deferred.reject(err);
			if (result)
				deferred.resolve(result);
			else  deferred.reject(err);
		});
	return deferred.promise;
}

function savePhoto(user, imgURL) {
	var deferred = Q.defer();
		var query = "UPDATE user SET photo = ? WHERE id= " + sql.escape(user);
		sql.query(query, [imgURL], function(err, result){ 
			if (err) {
				throw err;
				deferred.reject(err);
			}
			if (result)
				deferred.resolve(result);
			else  deferred.reject(err);
		});
	return deferred.promise;
}

// login by correct password
function authentication(mail, pass) {
	var deferred = Q.defer();
	var query = "SELECT * FROM user WHERE email = ? AND password = ?";
		sql.query(query, [  mail, pass ], function(err, result){ 
			if (err) {
				deferred.reject(err);
			}
			if (result && result.length > 0) {
				var payload = {  mail: mail, pass: pass}
				var token = jwt.sign( payload, 'secret', {expiresIn: 24*60*60});
				token = token + ',' + result[0]['id'];
				deferred.resolve(token);
			}
			else 
				deferred.reject(err);
		});
	return deferred.promise;
}

// Get the balance of the current user
function getBalance(userID) {
	var deferred = Q.defer();
	var query = "SELECT * FROM user WHERE id = ?";
	sql.query(query, [userID], function(err, result) {
		if (err) deferred.reject("No Balance");
		if (result && result.length > 0) {
			deferred.resolve(result[0]['balance']);
		}
	});
	return deferred.promise;
}

function getProfile(userID) {
	var deferred = Q.defer();
	var query = "SELECT * FROM user WHERE id = ?";
	sql.query(query, [userID], function(err, result) {
		if (err) deferred.reject("No Balance");
		if (result && result.length > 0) {
			deferred.resolve(result);
		}
	});
	return deferred.promise;
}

function getToken() {
	var deferred = Q.defer();
	var mail_id = localStorage.getItem('mail');
	var query = "SELECT * FROM user WHERE mail_id = ?";
	sql.query(query, [mail_id], function(err, result) {
		if (err) {
			deferred.reject("no user");
		}
		if (result && result.length > 0) {
			deferred.resolve(result[0]['id']);
		}
	});
	return deferred.promise;
}

function match(mail) {
	var deferred = Q.defer();
		var query = "SELECT * FROM user WHERE email=?";
		sql.query(query, [mail], function(err, result){ 
			if (err) {
				deferred.reject(err);
			}
			if (result && result.length>0) {
				deferred.reject('Already exist');
			}
			deferred.resolve(result);
		});
	return deferred.promise;
}

function emailConfirm(token) {
	var deferred = Q.defer();
		var query = "SELECT * FROM loginattempt WHERE password=?";
		sql.query(query, [token], function(err, result){ 
			if (err) {
				deferred.reject(err);
			}
			if (result && result.length > 0) {
				sql.query("DELETE FROM loginattempt WHERE password=?", [token], function(err){
					if (err) throw err;
				});
				var created_date = new Date();
				var query = "INSERT INTO user(name, email, password, user_type, promo_code, created_date) VALUES ?";
				var sendinfo = [
					[ result[0].name, result[0].email, token, result[0].userType, result[0].promo_code, created_date ]
				];
				sql.query(query, [sendinfo], function(err, result){ 
					if (err) {
						deferred.reject(err);
					}
					deferred.resolve(result);
				});
			}
			else {
				deferred.reject(err);
			}
		});
	return deferred.promise;
}

function verify(token) {
	var deferred = Q.defer();
	var email_id = localStorage.getItem('mail');
	if (email_id == null || token == 'success') deferred.resolve('ok');
	
	if (email_id) {
		sql.query("SELECT * FROM user WHERE mail_id = " + sql.escape(email_id), function(err, result) {
			if (err) {
				throw err;
				deferred.reject(err);
			}
			if (result && result.length > 0) {
				deferred.resolve(result[0]['id']);
			}
		});
	}
    jwt.verify(token, 'secret', function(err, decode){
		if (err) {
			deferred.reject(err);
		}  
		if (decode) {
			sql.query("SELECT * FROM user WHERE email = " + sql.escape(decode.email), function(err, result) {
				if (err) {
					throw err;
					deferred.reject(err);
				}
				if (result && result.length > 0) {
					deferred.resolve(result[0]['id']);
				}
			});
		}
    });
    return deferred.promise;
}

function _delete(_id) {

}
