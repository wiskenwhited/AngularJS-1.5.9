// config/passport.js
var jwt = require('jsonwebtoken');
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;
var LinkedinStrategy = require('passport-linkedin-oauth2').OAuth2Strategy;
var localStorage = require('localStorage');
var configAuth = require('./auth');
var sql = require('../mysql/db');

module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        sql.connect(function(err){
            if (err) return done(err);
            localStorage.setItem('mail', id);
            var query = "SELECT * FROM user WHERE mail_id=?";
            sql.query(query, [id], function(err, result) {
                if (err) return done(err);
                if (result && result.length!=0) {
                    return done(err, result)
                } 
            });
        });
    });
  
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    
    passport.use(new GoogleStrategy({
        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
    },function(token, refreshToken, profile, done) {
        var mysql = require('mysql');
        var sql = mysql.createConnection({
            host:'127.0.0.1',
            user: 'root',
            password: '',
            database: 'telecom'
        });
        process.nextTick(function() {
            
            sql.connect(function(err){
                if (err) return done(err);
                
                localStorage.setItem('mail', profile.id);
                var query = "SELECT * FROM user WHERE mail_id=?";
                var id = profile.id;
                sql.query(query, [profile.id], function(err, result) {
                    if (err) return done(err);
                    if (result && result.length!=0) {
                        return done(null, result)
                    } else {
                        var mail_id  = profile.id;
                        var token = token;
                        var name  = profile.displayName;
                        var email = profile.emails[0].value;
                        var auth_type = 'Google';
                        var query1 = "INSERT INTO user(mail_id, token, name, email, auth_type) VALUES ?";
                        var user = [
                            [mail_id, token, name, email, auth_type]
                        ];
                        sql.query(query1, [user], function(err) {
                            if (err) throw err;
                            return done(null, user);
                        });
                    }
                });
            });
        });
    }));
   

    // =========================================================================
    // Linkedin ==================================================================
    // =========================================================================
    passport.use(new LinkedinStrategy({
        clientID        : configAuth.linkedin.clientID,
        clientSecret    : configAuth.linkedin.clientSecret,
        callbackURL     : configAuth.linkedin.callbackURL,
        profileFields: ['id', 'first-name', 'last-name', 'email-address', 'headline']
    },
    function(token, refreshToken, profile, done){
        var mysql = require('mysql');
        var sql = mysql.createConnection({
            host:'127.0.0.1',
            user: 'root',
            password: '',
            database: 'telecom'
        });
        // User.findOne won't fire until we have all our data back from linkedin
        process.nextTick(function() {
            // try to find the user based on their linkedin id
            sql.connect(function(err){
                if (err) return done(err);
                var query = "SELECT * FROM user WHERE mail_id=?";
                var id = profile.id;
                sql.query(query, [profile.id], function(err, result) {
                    if (err) return done(err);
                    if (result && result.length!=0) {
                        return done(null, result)
                    } else {
                        var mail_id  = profile.id;
                        var name  = profile.name.familyName + '_' + profile.name.givenName;
                        var email = profile.emails[0].value;
                        var auth_type = 'Linkedin';
                        var query1 = "INSERT INTO user(mail_id, token, name, email, auth_type) VALUES ?";
                        var user = [
                            [mail_id, token, name, email, auth_type]
                        ];
                        sql.query(query1, [user], function(err) {
                            if (err) throw err;
                            return done(null, user);
                        });
                    }
                });
            });
        });
    }));

    // =========================================================================
    // Facebook ==================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL},
    function(token, refreshToken, profile, done){
        var mysql = require('mysql');
        var sql = mysql.createConnection({
            host:'127.0.0.1',
            user: 'root',
            password: '',
            database: 'telecom'
        });
        process.nextTick(function() {
            sql.connect(function(err){
                if (err) return done(err);
                var query = "SELECT * FROM user WHERE mail_id=?";
                var id = profile.id;
                sql.query(query, [profile.id], function(err, result) {
                    if (err) return done(err);
                    if (result && result.length!=0) {
                        return done(null, result)
                    } else {
                        var mail_id  = profile.id;
                        var name  = profile.name.givenName + '_' + profile.name.familyName;
                        var email = profile.emails[0].value;
                        var auth_type = 'Facebook';
                        var query1 = "INSERT INTO user(mail_id, token, name, email, auth_type) VALUES ?";
                        var user = [
                            [mail_id, token, name, email, auth_type]
                        ];
                        sql.query(query1, [user], function(err) {
                            if (err) throw err;
                            return done(null, user);
                        });
                    }
                });
            });
        });
    }));
};
