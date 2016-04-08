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

//Email
var nodemailer = require('nodemailer');

// geocoder
var geocoderProvider = 'google';
var httpAdapter = 'https';

var extra = {
    apiKey: 'AIzaSyBI5F7EZYenZ-CW4gukXeZMN8pAQC7me_Q', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
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

var uploadMulti = multer({ storage : storage }).array('userPhoto',2);

var isAuthenticated = function(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
  

   if (res.locals.login = req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    // res.render('loginError');
    res.redirect("/users/loginPage");
}


//Mail function
function handleSayHello(req, res, homeID) {
    // Not the movie transporter!
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'arjunmahen13@gmail.com', // Your email id
            pass: '1234Soccer' // Your password
        }
    });
    transporter.sendMail(mailOptions, function(error, info){
        console.log("done here 2");
    if(error){
        console.log("done here 3");
        console.log(error);
        res.json({yo: 'error'});
    }else{
        console.log("done here 4");
        console.log('Message sent: ' + info.response);
        res.json({yo: info.response});
    };
});
    console.log("done here 1");
    };

var text = 'Hey, you are nice';

var mailOptions = {
    from: 'arjunmahen13@gmail.com', // sender address
    to: 'eroppong@gmail.com, gjhandi@ryerson.ca, arjun.mahendran@ryerson.ca', // list of receivers
    subject: 'From EDP Server', // Subject line
    text: text //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
};

//router.post('/sayHello', handleSayHello);

/* GET login page. */
router.get('/sayHello', handleSayHello, function(req, res) {

});




/* GET login page. */
router.get('/', isAuthenticated,function(req, res) {
    // Display the Login page with any flash message, if any
    res.redirect('/homes/homelist');
});
/* GET login page. */
router.get('/bootleg', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('testBoot');
});
/* GET login page. */
router.get('/s2', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('signup2');
});
/* GET login page. */
router.get('/userProfile', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('userProfile');
});
/* GET login page. */
router.get('/userPage', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('userPage');
});
/* GET login page. */
router.get('/multi', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('multiUpload');
});

/* GET login page. */
router.get('/listTest', function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('listTest');
});

/* GET login page. */
router.get('/test2', isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('users', {
        message: req.flash('message')
    });
});

router.get('/checklogin',function(req,res){
  if (req.user)
    res.send(true);
  else
    res.send(false);
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

router.post('/uploadphoto', isAuthenticated ,function(req,res){
        upload(req,res,function(err){
            if(err){
                return res.send(err.status);
            }
            var extension = req.user._id;
            console.log(extension);
            console.log(req.file.path);

        var query = { 'username' :req.user.username };
        var newUser = new User();

        var pathstr = req.file.path;
        newUser.photopath = pathstr.slice(7);


        User.findOneAndUpdate(query, {photopath : newUser.photopath}, {upsert:true}, function(err, doc){
            if(err)
                return res.send(500, {error: err});
            else
                return res.redirect("/users/show");
        });

    });
});



module.exports = router;
