var _ = require('lodash');
var Q = require('q');
var sql = require('../mysql/db');
const fs = require('fs');
var parse = require('csv-parse');
var path = require('path');
var dateTime = require('node-datetime');
var json2csv = require('json2csv');
var service = {};

service.getJob = getJob;
service.downloadCheck = downloadCheck;
service.addDnc = addDnc;
service.getJobID = getJobID;
service.getData = getData;
service.startDNC = startDNC;
service.fetchDNC = fetchDNC;
service.setStatus = setStatus;
service.deleteRow = deleteRow;
service.delJOb = delJOb;
service.put = put;
module.exports = service;

// Fetch DNC data as per sec
function fetchDNC(userID) {

    var deferred = Q.defer();
    if (!userID) deferred.reject({user: "No user"});
    var query = "SELECT * FROM dnc_sift WHERE user_id = ?";
    sql.query(query, [userID], function(err, result) {
        if (err) {
            throw err;
            deferred.reject(err);
        }
        if (result && result.length > 0) {
            deferred.resolve(result);
        } else deferred.reject({});
    });
    return deferred.promise;
}

function setStatus(jobID) {
  
    var deferred = Q.defer();
    if (!jobID) deferred.reject({error: "cann't set the status"});
    var query = "UPDATE dnc_sift SET download_status = 1 WHERE id = ?";
    sql.query(query, [jobID], function(err, result) {
        if (err) {
            throw err;
            deferred.reject(err);
        }
        if (result) {
            deferred.resolve(result);
        } else deferred.reject({});
       
    });
    return deferred.promise;
}

// Get the job ID
function getJobID(userID) {
    var deferred = Q.defer();
    var query = "SELECT * FROM dnc_sift WHERE user_id = ?";
    sql.query(query, [userID], function(err, result) {
        if (err) {
            throw err;
            deferred.reject(err);
        }
        if (result && result.length > 0) {
            deferred.resolve(result[0]['id']);
        }
    });
    return deferred.promise;
}

function delJOb(jobID) {
    var deferred = Q.defer();
    var query = "DELETE FROM dnc_sift WHERE id = ?";
    sql.query(query, [jobID], function(err, result) {
        if (err) {
            throw err;
            deferred.reject(err);
        }
        if (result && result.length > 0) {
            deferred.resolve({deleted: jobID});
        }
    });
    return deferred.promise;
}

function downloadCheck(userID, type, realFilename) {
    var down = Q.defer();
    var initialPath = path.resolve(__dirname, '../csvData/downloadCSV/' + type + '/' + type + '_' + realFilename);
    var dnc = [], gold = [];
    fs.readFile(initialPath, 'utf8', function(err, data) {
        if (err) {
            down.reject({error: err});
        }
        var judge = data.split(/\r\n|\n/);
        if (!judge || judge.length < 1)  {
            down.reject({error: 'nodata'});
        } else {
            down.resolve("success");
        }
    });
    return down.promise;

}

function getData(userID) {
    var deferred = Q.defer();
    var query = "SELECT * FROM user WHERE id = " + sql.escape(userID);
    sql.query(query, function(err, result) {
        if (err) 
            deferred.reject(err);
        var balance = 0;
        if (result && result.length > 0) {
            balance = result[0]['balance'];
        }
        sql.query("SELECT * FROM dnc_sift WHERE user_id = " + sql.escape(userID), function(err, result) {
            if (err) 
                deferred.reject(err);
            if (result && result.length > 0) {
                var value = {
                    balance: balance,
                    dnc: result
                }
                deferred.resolve(value);
            }
        });
    });
    return deferred.promise;
}

// Get all of the dncJob list
function getJob(userID) {
    var deferred = Q.defer();
    sql.query("SELECT * FROM user WHERE id=?", [userID], function(err, result) {
        if (err) {
            throw err;
            deferred.reject(err);
        }
        if (result && result.length > 0) {
            var query = "SELECT * FROM dnc_sift where user_id = ?";
            sql.query(query, [userID], function(err, result) { 
                if (err) {
                    deferred.reject(err);   
                }
                if (result && result.length > 0) {
                    var response = [];
                    for (let i=0; i<result.length; i++) {
                        var data = {
                            id: result[i].id,
                            filename: result[i].filename,
                            dnc: result[i].dnc,
                            gold: result[i].gold,
                            total: result[i].total,
                            progress: result[i].progress,   
                            cost_matches: result[i].cost_matches,
                            cost_dips: result[i].cost_dips,
                            total_cost: result[i].total_cost,
                            status: result[i].status,
                            created_date: result[i].created_date,
                            real_filename: result[i].real_filename,
                            download_status: result[i]['download_status'],
                            payment_status: result[i]['payment_status']
                        };
                        response.push(data);
                    }
                    deferred.resolve(response);
                } else {
                    deferred.reject(err);
                }
            });

        } else {
            deferred.reject("No balance");
        }
    });
  
    return deferred.promise;
}

function addDnc(filename, realFilename, inputPath,  userID) {
    var deferred = Q.defer();
    var query = "INSERT INTO dnc_sift(filename, created_date, status, user_id, cost_matches, cost_dips, real_filename, file_path) VALUES ?";
    var dnc_created_date = new Date();
    var addRow = [
        [ filename, dnc_created_date, '1', parseInt(userID), 0.008, 0.005, realFilename, inputPath ]
    ];
    sql.query(query, [addRow], function(err, result){ 
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

function processSync(dataArray, mainArray, dncArray, goldArray, cur, options, callback) {
    if(cur >= dataArray.length) {
        return callback(null, {success: true});
    }
    // Extract the phonenumber fields from the csv file
    var phoneNumber = dataArray[cur].phoneNumber;
    var fieldCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    var dncFieldLength, goldFieldLength;
    var query = "SELECT * FROM dnc WHERE dnc = ?";

    // Match the valid US phoneNumber from the dnc table and Calculate the dnc and gold, balance fields from it
    sql.query(query, [phoneNumber], function(err, result) {
        if (err) {
            throw err;
            callback(err, null);
        }
        var cost_per_match = 0.005 + 0.008;
        var cost_per_dip = 0.005;
        // Match case with the dnc number against the dnc table
        if (result && result.length > 0) {        
            options.dnc++; // increase dnc
            options.balance -= cost_per_match;
            options.cost_matches = options.dnc * cost_per_match;

            var fetchRow = mainArray[dataArray[cur].index].toString();
            var dncFieldsArray = fetchRow.split(',');      // spilit by comma
            dncFieldLength = dncFieldsArray.length;     // get length
            var dncCSVRow = {};
            var dncColumnData = {};
            dncFieldsArray.forEach(function(val, index) {
                var head = fieldCharacters[index].toString();
                dncColumnData[head] = val;
            }, this);
            

            dncArray.push(dncColumnData);
            // console.log("check it\n\n\n", dncArray);
        
        // Dismatch
        } else { 
            // console.log("CurrentPosition: ", cur);
            options.gold++; // increase gold
            options.cost_dips = cost_per_dip * options.gold; // increase cost_dips by multiply

            var fetchRow = mainArray[dataArray[cur].index].toString();
            var goldFieldsArray = fetchRow.split(',');      // spilit by comma
            goldFieldLength = goldFieldsArray.length;     // get length
            var goldCSVRow = {};
            var jsonVariable = {};
            goldFieldsArray.forEach(function(val, index) {
                var head = fieldCharacters[index].toString();
                jsonVariable[head] = val;
            }, this);

            goldArray.push(jsonVariable);
        }

        var total = options.dnc + options.gold;        // calculate number of total by dnc and gold
        var progress = total / (dataArray.length) * 100;   // calculate the progress by row
        options.total_cost = options.cost_matches + options.cost_dips;

        var state = '2';
        if (total == dataArray.length)
            state = '3';  // Finished state

        var dt = dateTime.create();
        var time = dt.format('Y-m-d H:M:S');
        var total_cost = options.total_cost;
        var payment_status = 0;
        if (cur <= dataArray.length && cur == dataArray.length - 1) {
            payment_status = 1;
            status = 3;
        }

        var input = [
            options.dnc, options.gold, options.cost_dips, options.cost_matches, payment_status, total_cost, total, progress, state, time
        ];
        
        var query = "UPDATE dnc_sift SET dnc =?, gold =?, cost_dips =?, cost_matches=?, payment_status=?, total_cost =?, total =?, progress =?, status =?, finished_date =? WHERE user_id = " + sql.escape(options.userID) + " AND real_filename = " + sql.escape(options.realFilename);
            sql.query(query,  input , function(err, result) {
            if (err) { 
                callback(err, null);
            }
            if (result) {
                  
                if (cur <= dataArray.length && cur == dataArray.length - 1) {
                    var fields = [];
                    // Save the data and generate the dnc job csv file into the download directory
                    for (var i = 0; i<goldFieldLength; i++) {
                        fields.push(fieldCharacters[i]);
                    }
                    var csv = json2csv({ data: goldArray, fields: fields,  quotes :'', doubleQuotes :'', hasCSVColumnTitle :false, del: ',' });
                    var downPath = path.resolve(__dirname, '../csvData/downloadCSV/gold/' + 'gold_' + options.realFilename );
                    fs.writeFile(downPath, csv, function(err, data) {
                        if (err) {throw err;}
                        if (dncArray.length > 0) {
                            var csv = json2csv({ data: dncArray, fields: fields, del: ',' , quotes :'', doubleQuotes :'', hasCSVColumnTitle :false});
                            var downPath = path.resolve(__dirname, '../csvData/downloadCSV/dnc/' + 'dnc_' + options.realFilename );
                            fs.writeFile(downPath, csv, function(err, data) {
                                if (err) {
                                    throw err;
                                }
                                
                            }); 
                        }
                    }); 
                }
            }
            processSync(dataArray, mainArray, dncArray, goldArray, cur+1, options, callback);     
        });
       
    });
}

// Start DNC JOB
function startDNC( realFilename, userID, type) {
    var initialPath = path.resolve(__dirname, '../csvData/uploadCSV/' + userID + '/' + realFilename);
    var deferred = Q.defer();
    var balanceFlag = false;

    // initialize
    var dnc = 0;
    var gold = 0;
    var balance = 0;
    var progress = 0;
    var cost_dips = 0;
    var cost_matches = 0;
    
    var startPosition;

    
    // Get the cost_dips and cost_matches in the dnc_table
    sql.query("SELECT * FROM dnc_sift WHERE user_id = ? AND real_filename = " + sql.escape(realFilename), [userID], function(err, result) {
        if (err) {
            throw err;
            deferred.reject(err);
        }
        if (result && result.length>0) {
            cost_dips = result[0]['cost_dips'];
            cost_matches = result[0]['cost_matches'];
            dnc = parseInt(result[0]['dnc']);
            gold = parseInt(result[0]['gold']);
        }
        
        // Read the csv file from the input
        fs.readFile(initialPath, 'utf8', function(err, data) {
            if (err) deferred.reject({error: 'Cannot read the file'});

            var numberArray = [], mainArray = [];
            if (data == undefined) deferred.reject(data);
            let allTextLines = data.split(/\r\n|\n/);
            let headers = allTextLines[0].split(',');
            let lines = [];

            for ( let i = 0; i < allTextLines.length; i++) {
                let data = allTextLines[i].split(',');
                if (data.length == headers.length) {
                    let tarr = [];
                    for ( let j = 0; j < headers.length; j++) {
                        tarr.push(data[j].replace(/;+/g, ''));
                    }
                    lines.push(tarr);
                }
            }
            mainArray = lines;

            lines.forEach(function(val, index) {
                val.forEach(function(real) {
                    if (real.length == 10 && !isNaN(real)) {
                        numberArray.push({phoneNumber: real, index: index });
                    }
                })
            }, this);

            startPosition = parseInt(dnc) + parseInt(gold) + 0;

            if (isNaN(dnc)) dnc = 0;
            if (isNaN(gold)) gold = 0;
            if (isNaN(startPosition)) startPosition = 0;

            balance = 0;
            
            if (type == 'upload') startPosition = 0;
            var total_cost = 0;
            var dncArray = [], goldArray = [];
            // Progress the contents of the uploaded csv file inside loop
            if (startPosition < (numberArray.length - 1) ) {
                processSync(numberArray, mainArray, dncArray, goldArray, startPosition, { 
                        dnc: dnc, 
                        gold: gold, 
                        balance: balance, 
                        cost_dips: cost_dips,
                        cost_matches: cost_matches,
                        userID: userID,
                        realFilename: realFilename,
                        total_cost: total_cost
                    }, function(err, status) {
                        if(err)
                            deferred.reject(err);
                        else
                            deferred.resolve();
                    });
            }
        });
    });
    return deferred.promise;
}

// temporary DB for email confirmation
function insert(user, token) {
    var deferred = Q.defer();
    var query = "INSERT INTO loginattempt(name, email, password, user_type, promo_code) VALUES ?";
    var userinfo = [
        [ user.fullname, user.email, token, user.userType, user.promo_code ]
    ];
    sql.query(query, [userinfo], function(err, result){ 
        if (err) deferred.reject(err);
        if (result)
            deferred.resolve(result);
        else  deferred.reject(err);
    });
    return deferred.promise;
}

function put(user, token) {
    var deferred = Q.defer();
    var query = "INSERT INTO loginattempt(name, email, password, user_type, promo_code) VALUES ?";
    var userinfo = [
        [ user.fullname, user.email, token, user.userType, user.promo_code ]
    ];  
    sql.query(query, [userinfo], function(err, result){ 
        if (err) deferred.reject(err);
        if (result)
            deferred.resolve(result);
        else  deferred.reject(err);
    });
    return deferred.promise;
}

function deleteRow(user, token) {
    var deferred = Q.defer();
    var query = "INSERT INTO loginattempt(name, email, password, user_type, promo_code) VALUES ?";
    var userinfo = [
        [ user.fullname, user.email, token, user.userType, user.promo_code ]
    ];
    sql.query(query, [userinfo], function(err, result){ 
        if (err) deferred.reject(err);
        if (result)
            deferred.resolve(result);
        else  deferred.reject(err);
    });
    return deferred.promise;
}



