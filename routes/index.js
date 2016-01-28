var express = require('express');
var router = express.Router();
var passport = require('passport');
var multer = require('multer');
var User = require('../models/user');
var request = require('request');

// geocoder
var geocoderProvider = 'google';
var httpAdapter = 'https';

var extra = {
    apiKey: 'AIzaSyBI5F7EZYenZ-CW4gukXeZMN8pAQC7me_Q', // for Mapquest, OpenCage, Google Premier 
    formatter: null         // 'gpx', 'string', ... 
};

var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function(req, file, callback) {
        callback(null, req.user._id + '-' + Date.now() + '.' + file.originalname.split(/[. ]+/).pop());
    }
});

var upload = multer({
    storage: storage
}).single('userPhoto');

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
router.get('/', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('welcome');
});
/* GET login page. */
router.get('/property', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('property');
});

/* GET login page. */
router.get('/test2', isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('users', {
        message: req.flash('message')
    });
});
router.get('/test', function(req, res) {
    // Display the Login page with any flash message, if any
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=4016+chicory+court"

    geocoder.geocode('4016 chicory court, mississauga', function(err, result) {
    geocodedresult = result;
    console.log(geocodedresult[0].formattedAddress);
	var output = geocodedresult[0].latitude;
	output = output + ' ';
	output = output + geocodedresult[0].longitude;


    res.send(output);


});

});

router.post('/uploadphoto', isAuthenticated, function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            return res.send("Error uploading file");
        }
        var extension = req.user._id;
        console.log(extension);
        console.log(req.file.path);

        var query = {
            'username': req.user.username
        };
        var newUser = new User();

        var pathstr = req.file.path;
        newUser.photopath = pathstr.slice(7);
        //newUser.photopath = newUser.photopath.replace('/path', '')
        User.findOneAndUpdate(query, {
            photopath: newUser.photopath
        }, {
            upsert: true
        }, function(err, doc) {
            if (err)
                return res.send(500, {
                    error: err
                });
            else
                return res.send("Successfully Saved");

        });
        // function callback (err, numAffected) {
        //   // numAffected is the number of updated documents
        // });

        // var query = { username : req.user.username };
        // User.update(query, { photopath: 'req.file.path' }, options, callback);

        res.send("Files is uploaded");
    });
});

module.exports = router;