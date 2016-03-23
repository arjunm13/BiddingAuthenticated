var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
var User = require('../models/user');
var request = require('request');

//ADMIN TEST STUFF
var Home = require('../models/home');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
// END admin test stuff



var isAuthenticated = function(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.render('welcome');
}

/* GET login page. */
router.get('/', isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    if (req.user.username == 'ADMIN') {
        Home.find({}, function(err, homes) {
            var homeMap = [];

            homes.forEach(function(home) {
                homeMap.push(home);
            });

            res.render('admin', {
                homes: homeMap
            });
        });

    } else {
        res.send("NOT ADMIN");
    }


});

router.post('/verify/:homeid/:verified', isAuthenticated, function(req, res) {

        var homeid = req.params.homeid;
        var verified = req.params.verified;

        var query = {
            "_id": homeid
        };

        var update = {
            "publicTrue": verified
        }
        
        Home.findOneAndUpdate(query, update, {
            upsert: true
        }, function(err, doc) {
            if (err)
                return res.send(500, {
                    error: err
                });
            else
                res.redirect('/homes/show/' + homeid);

        });


});


module.exports = router;