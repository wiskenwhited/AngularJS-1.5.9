// routes/index.js
var jwt =require('jsonwebtoken');
var config = require('config');
var path = require('path');
var fs = require('fs');
var session = require('express-session');
var cors = require("cors");
module.exports = function(app, passport) {
    app.use(cors)
    app.use('/user', require('../controllers/users.controller'));
    app.use('/dnc', require('../controllers/dncSift.controller'));
    app.use('/paypal', require('../controllers/paypal.controller'));

    // failed
    app.get('/exit', function(req, res){
        res.sendFile('failure.html', {root: path.join(__dirname, '../views')});
    });

    // succeed
    app.get('/profile',  function(req, res) { 
        var token = jwt.sign({remote: req._remoteAddress}, 'secret', {expiresIn: 24*60*60});
        var response = res;
        res.sendFile('success.html', {root: path.join(__dirname, '../views')});
    });

    // Google authentication
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect : '/back',
        failureRedirect : '/exit'   
    }));

    // Linkedin authentication
    app.get('/auth/linkedin', passport.authenticate('linkedin', { scope : ['r_basicprofile', 'r_emailaddress'] }));

    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
        successRedirect : '/profile',
        failureRedirect : '/exit'
    }));

    // Facebook authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['user_friends', 'manage_pages'] }));

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/profile',
        failureRedirect : '/exit'
    }));

    app.get('/auth/paypal/callback', function(req, res){
        console.log("paypal account verified", req);
        res.redirect('/');
    });

    app.get('/back', function(req, res) {
        req.logout();
        res.redirect(302, "https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=" + config.host +":4000/profile");
    });
    
    function loggedin(req, res) {
        var property = 'user';
        if (this._passport && this._passport.instance._userProperty) {
            property = this._passport.instance._userProperty;
        }
        return (this[property]) ? true : false;
    };

};

