var config = require('../config/env/default');
var express = require('express');
var bcrypt = require('bcrypt');
var fs = require('fs');
var path = require('path');
var jsonexport = require('jsonexport');
var json2csv = require('json2csv');
var router = express.Router();  
var dateTime = require('node-datetime');
var dncService = require('../services/dncSift.service');

// routes
router.get('/getAll/:user_id', getAll);
router.get('/setStatus/:job_id', setStatus);
router.get('/delete/:job_id', delJOB);
router.get('/process/:user_id/:real_filename', dncProcess);
router.get('/download/:type/:user_id/:filename', download);
router.post('/uploadcsv/:filename/:user_id/:balance', uploadCSV);

module.exports = router;

// DNC Process
function dncProcess(req, res) {
    var user_id = req.params.user_id;
    var real_filename = req.params.real_filename;
    dncService.startDNC(real_filename, user_id, 'process')
        .then(function(data) {
            res.status(200).send(data);
        })
        .catch(function(err) {
            res.status(400).send(err);
        })
}

function setStatus(req, res) {
    var job_id = req.params.job_id;
    dncService.setStatus(job_id)
        .then(function(data) {
            res.status(200).send(data);
        })
        .catch(function(err) {
            res.status(400).send(err);
        })
}

function delJOB(req, res) {
    var job_id = req.params.job_id;
    dncService.delJOb(job_id)
        .then(function(data) {
            console.log(data + "deleted");
            res.status(200).send(data);
        });
}

function download(req, res) {
    var userID = req.params.user_id;
    var type = req.params.type;
    var filename = req.params.filename;
    dncService.downloadCheck(userID, type, filename)
        .then(function(data) {
            res.status(200).send('/downloadCSV/' + type + '/' + type + '_' + filename);
        })
        .catch(function(err) {
            res.status(400).send("Not found the csv data");
        });
}
//========================================================
//===DNC SiftJob DATA FETCH===============================
//========================================================
function getStream(req, res) {
    var i = 0;
    var userID = 1;//req.userID;
    getData(userID, res);
} 

function getData(userID, res) {
    dncService.getData(userID)
        .then(function(result) {
            res.sse('data: ' + JSON.stringify(result));

            setTimeout(function(){
                console.log('running recursive: ', userID);
                getData(userID, res);
            }, 3000);
        });
}

//========================================================
//===GET DNC SiftJob======================================
//========================================================
function getAll(req, res){
    var userID = req.params.user_id;
    global.user_id = userID;

    dncService.getJob(userID)
        .then(function(response){
            res.status(200).send(response);
        });
}

//========================================================
//===UPLOAD CSV FILE AND PROCESS THE CONTENTS=============
//========================================================
function uploadCSV(req, res){
    var file = req.files.uploads;
    var filename = req.params.filename;
    var balance = req.params.balance;
    var userID = req.params.user_id;

    var dir = path.resolve(__dirname, '../csvData/uploadCSV/' + userID + '/');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    var dt = dateTime.create();
    var time = dt.format('Y_m_d_H_M_S');

    var filename = filename.replace('.csv', '');
    var realFilename =  filename + '_' + time + '.csv';

    file.mv(path.join(__dirname, '../csvData/uploadCSV/' + userID + '/' +  realFilename), function(err) {
        if (err) {
            throw err;
            return res.status(500).send(err);
        }

        dncService.addDnc(filename, realFilename, dir, userID)  
            .then(function(data) {
                dncService.startDNC( realFilename, userID, 'upload');
                res.status(200).send(data);
            })
            .catch(function(err) {
                res.status(400).send(data);
            });
    });
   
}