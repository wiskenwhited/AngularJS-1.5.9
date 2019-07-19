var cron = require('node-cron');
var dncService = require('../services/dncSift.service');
var sql = require('../mysql/db');

var dncTask = cron.schedule('10,20,30,40,50,59 * * * * *', function(){
    // sql.query("SELECT user_id, real_filename FROM dnc_sift WHERE status = 1 OR status = 2 ", function(err, result) {
    //     if (err) {
    //         return err;
    //     }
    //     var dncTask = [];
    //     if (result && result.length > 0) {
    //         result.forEach(function(val, index) {
    //             dncTask.push(val)
    //         }, this);
    //     }
    //     if (dncTask && dncTask.length > 0) {
    //         dncTask.forEach(function(val, index) {
    //                //  Job start
    //                console.log("dncSIFT job start counting...");
    //             var task = val;
    //             dncService.startDNC( task.real_filename, task.user_id, 'process') 
    //                 .then(
    //                 function(data) {
    //                     console.log("Sucess: ", data);
    //                 })
    //                 .catch( err => {
    //                     console.log("Error: ", err);
    //                 });
    //         }, this);
    //     }
    // });
});

module.exports = dncTask;
