var express = require('express');
var router = express.Router();
var Home = require('../models/home');
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId


var isAuthenticated = function(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.render('loginError');
}

/* GET login page. */
router.get('/', isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('homes', {
        message: req.flash('message')
    });
});

/* GET login page. */
router.get('/new', isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('newHome');
});

/* GET login page. */
router.post('/new', isAuthenticated, function(req, res) {
    var newHome = new Home();

    // set the user's local credentials
    newHome.userid = req.user._id;
    newHome.address = req.param('address');
    newHome.price = req.param('price');
    newHome.squareFoot = req.param('squareFoot');
    newHome.rooms = req.param('rooms');

    newHome.save(function(err, newHome) {
        if (err) {
            return next(err)
        }
        //res.json(201, newHome);
        res.redirect('/homes/homelist');
    });

});

/* GET login page. */
router.get('/homelist', function(req, res) {

    Home.find({}, function(err, homes) {
        var homeMap = [];

        homes.forEach(function(home) {
            homeMap.push(home);
        });

        //res.json(homeMap);
        res.render('homelist', {
            homes: homeMap
        });


    });
});

router.get('/show/:id', function(req, res) {

    var homeid = req.params.id;
    console.log(homeid);
    var query = {
        "_id": ObjectId(homeid)
    };
    console.log(homeid);

    Home.findById(query, function(err, homes) {
        if (err) {
            console.log(err.status);
        } else {
            res.json(homes);
        }

    });
});



module.exports = router;