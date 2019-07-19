var config = require('config');
var express = require('express');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
var router = express.Router();
var userService = require('services/user.service');
var path = require('path');
var fs = require('fs');
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

// routes
router.get('/emailconfirmation/:response', mailResponse);
router.get('/verify/:token', tokenCheck);
router.get('/getbalance/:user_id', getBalance);
router.get('/getProfile/:user_id', getProfile);
router.get('/gettoken', getToken);
router.post('/create', register);
router.post('/photo/:user_id', savePhoto);
router.post('/login', auth);

module.exports = router;

function getBalance(req, res) {
    var userID = req.params.user_id;
    userService.getBalance(userID)
        .then(
            balance => res.status(200).send(balance)
        )
        .catch(err => res.status(400).send(err));
}

function savePhoto(req, res) {
    var userID = req.params.user_id;
    var file = req.files.image;
    var filename = file.name;
    var dir = path.resolve(__dirname, '../client/user/photo');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    var filepath = path.resolve(__dirname, '../client/user/photo/' + userID + filename);
    var realPhotoPath = '/user/photo/' + userID + filename;
    file.mv(path.join(__dirname, '../client/user/photo/' + userID + filename), function(err) {
        if (err) {
            throw err;
            return res.status(500).send(err);
        }
         userService.savePhoto(userID, realPhotoPath)
            .then(
                data => res.status(200).send(data)
            )
            .catch(err => res.status(400).send(err));
    });
    // img = img.replace(/^data:image\/\w+;base64,/, "");
    // img = img.replace(/ /g, '+');
    // fs.writeFile(filepath, img, 'base64', function(err) {
    //     if (err)
    //         res.status(400).send(err)
    // });
   
}

function getProfile(req, res) {
    var userID = req.params.user_id;
    userService.getProfile(userID)
        .then(
            profile => res.status(200).send(profile)
        )
        .catch(err => res.status(400).send(err));
}
//========================================================
//===Match information and send email for sign up=========
//========================================================
function register(req, res) {
    //==Make sure that user already exists===
    
    userService.match(req.body.email)
        .then(function(user){

                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth   : {
                        user  : 'apple930108@gmail.com',
                        pass  : 'Ajgkfwjfwkeaj108'
                    }
                });
                var token = encrypt(req.body.pass1);
                var validationEmail = config.host + ':4000/user/emailconfirmation/' + token;
                var mailOptions = {
                    from    : 'Hollywood Telecom Inc',
                    to      : req.body.email,
                    subject : 'Hollywood Telecom Inc',
                    html    : '<p><b>Hello</b> to ' + req.body.fullname +
                            '<br/><br/>Welcome to Hollywood Telecom Inc ' +
                            '<p>Please click the following link to verify your account:<br/><a href="' + validationEmail +'">Hollywood Telecom Inc</a></p>',
                };

                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                        res.status(400).send(error);
                    } else {
                        userService.create(req.body, token)
                            .then(function (user) {
                                res.status(200).send(user);
                            })
                            .catch(function (err) {
                                res.status(400).send(err);
                            });
                    }
                });
            })
        .catch((err) => (res.status(400).send(err)));
}

//========================================================
//===Match user info in the db for login==================
//========================================================
function auth(req, res) {
    var email = req.body.smail;
    var password = encrypt(req.body.password);
    userService.authentication(email, password)
        .then(function (auth) {
            res.status(200).send(auth);
        })
        .catch(function (err) {
            res.status(400).send(err);
    });
}

//========================================================
//===Email confirmation and redirect======================
//========================================================
function mailResponse(req, res) {
    var token = req.params.response;
    if (token && token!='out') // external request
        userService.emailConfirm(req.params.response)
            .then(function (user) {
              res.redirect('/#/login?account=' + token);
            })
            .catch(function(err){
              res.redirect(config.host + ':4000');
            });
    
}


function tokenCheck(req, resp) {
    var token = req.params.token;
    if (token) {
        userService.verify(token)
            .then(function(res) {
                resp.status(200).send(res.toString());
            })
            .catch(function(err){
                resp.status(400).send(err);
            });
           
    }
}

function getToken(req, res) {
        userService.getToken()
            .then(function(userID) {
                 res.status(200).send(userID.toString());
            })
            .catch(function(err){
                resp.status(400).send(err);
            });
}

function parseCookies (req) {
    var list = {},
    rc = req.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}
 
function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}


