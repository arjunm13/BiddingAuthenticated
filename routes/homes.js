var express = require('express');
var router = express.Router();
var Home = require('../models/home');
var Bid = require('../models/bid');
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

// geocoder
var geocoderProvider = 'google';
var httpAdapter = 'https';

var extra = {
    apiKey: 'AIzaSyBI5F7EZYenZ-CW4gukXeZMN8pAQC7me_Q', // for Mapquest, OpenCage, Google Premier 
    formatter: null // 'gpx', 'string', ... 
};

var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);

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
    res.render('homes', {
        message: req.flash('message')
    });
});

/* GET login page. */
router.get('/new', isAuthenticated, function(req, res) {
    // Display the Login page with any flash message, if any
    res.render('newhome');
});

/* GET login page. */
router.post('/new', isAuthenticated, function(req, res) {
    var newHome = new Home();

    var search = req.param('address') + ' ' + req.param('city') + ' ' + req.param('province');

    geocoder.geocode(search, function(err, result) {
        geocodedresult = result;
        console.log(geocodedresult[0].formattedAddress);
        console.log(geocodedresult[0].longitude);
        var output = geocodedresult[0].latitude;
        output = output + ' ';
        output = output + geocodedresult[0].longitude;
        var lg = geocodedresult[0].longitude;
        var lt = geocodedresult[0].latitude;



        // set the user's local credentials
        newHome.userid = req.user._id;
        newHome.address = geocodedresult[0].formattedAddress;
        newHome.city = req.param('city');
        newHome.province = req.param('province');
        newHome.price = req.param('price');
        newHome.squareFoot = req.param('squareFoot');
        newHome.rooms = req.param('rooms');
        newHome.bids.bidvalue = 0;
        newHome.bids.userid = '000';
        newHome.highestbidid = '000';
        newHome.loc = [lg, lt];



        newHome.save(function(err, newHome) {
            if (err) {
                return next(err)
            }
            //res.json(201, newHome);
            res.redirect('/homes/homelist');
        });

    });
});

/* GET login page. */
router.get('/homelist', isAuthenticated, function(req, res) {

    Home.find({}, function(err, homes) {
        var homeMap = [];

        homes.forEach(function(home) {
            homeMap.push(home);
        });

        res.render('homelist', {
            homes: homeMap
        });

    });
});

/* GET login page. */
router.get('/search', isAuthenticated, function(req, res) {

    var area = req.param('searcharea');

    geocoder.geocode(area, function(err, result) {

        if (err) {
            console.log(err.status);
        } else {

            geocodedresult = result;



            var limit = 10;

            // get the max distance or set it to 8 kilometers
            var maxDistance = 800;

            // we need to convert the distance to radians
            // the raduis of Earth is approximately 6371 kilometers
            maxDistance /= 6371;

            // get coordinates [ <longitude> , <latitude> ]
            var coords = [];
            coords[0] = geocodedresult[0].longitude;
            coords[1] = geocodedresult[0].latitude;

            // find a location
            Home.find({
                loc: {
                    $near: coords,
                    $maxDistance: maxDistance
                }
            }).limit(limit).exec(function(err, homes) {
                if (err) {
                    return res.json(500, err);
                }
                        var homeMap = [];

                        homes.forEach(function(home) {
                            homeMap.push(home);
                        });

                        res.render('homelist', {
                            homes: homeMap
                        });


               // res.json(200, locations);
            });


        }


    });

 });



//     Home.find({}, function(err, homes) {
//         var homeMap = [];

//         homes.forEach(function(home) {
//             homeMap.push(home);
//         });

//         res.render('homelist', {
//             homes: homeMap
//         });

//     });
// });

router.get('/show/:id', isAuthenticated, function(req, res) {

    var homeid = req.params.id;
    console.log(homeid);
    var query = {
        "_id": ObjectId(homeid)
    };

    Home.findById(query, function(err, homes) {
        if (err) {
            console.log(err.status);
        } else {
            res.render('property', {
                home: homes
            });
        }
    });
});

router.post('/show/:homeid/bid', function(req, res) {

    var homeid = req.params.homeid;
    var bidv = req.param('bidvalue');
    var url = '/homes/show/' + homeid;
    console.log(homeid);
    console.log(bidv);

    var query = {
        "_id": ObjectId(homeid)
    };

    Home.find({
        "_id": homeid,
        "bids.bidvalue": {
            $gt: bidv
        }
    }, function(err, docs) {
        if (err) {
            console.log(err.message);
        } else {
            if (docs.length < 1) {
                console.log("Nothing higher");
                Home.findByIdAndUpdate(query, {
                    $push: {
                        "bids": {
                            bidvalue: bidv,
                            userid: req.user._id
                        }
                    }
                }, {
                    safe: true,
                    upsert: true,
                    new: true
                }, function(err, model) {
                    if (err) {
                        console.log(err.status);
                    } else {

                        console.log('_id assigned is: %s', model.bids[model.bids.length - 1]._id);
                        var highestBid = model.bids[model.bids.length - 1]._id;
                        Home.findOneAndUpdate(query, {
                            highestbidid: highestBid,
                            highestbidvalue: bidv
                        }, {
                            upsert: true
                        }, function(err, doc) {
                            if (err)
                                return res.send(500, {
                                    error: err
                                });
                            else
                            // return res.send("Successfully Saved");
                            //res.json(doc);
                                res.redirect(url);

                        });

                    }

                });

            } else {
                console.log(docs.length);
                res.send("Not a higherbid");
                // res.json({
                //     'Error': 'Not higher bid'
                // });
            }
        }
    });

});




module.exports = router;