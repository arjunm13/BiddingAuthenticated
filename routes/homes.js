var express = require('express');
var router = express.Router();
var Home = require('../models/home');
var Bid = require('../models/bid');
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

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

router.get('/show/:id', function(req, res) {

    var homeid = req.params.id;
    console.log(homeid);
    var query = {
        "_id": ObjectId(homeid)
    };

    Home.findById(query, function(err, homes) {
        if (err) {
            console.log(err.status);
        } else {
            res.json(homes);
        }
    });
});

router.get('/show/:homeid/bid/:bidvalue', isAuthenticated, function(req, res) {

    var homeid = req.params.homeid;
    console.log(homeid);

    var query = {
        "_id": ObjectId(homeid)
    };

    console.log(homeid);
    // var bid = req.param.bidvalue;
    // var user = req.user._id;
    console.log(req.params.bidvalue);
    console.log(req.user._id);

    // var newBid = new Bid();

    // newBid.bidvalue = req.params.bidvalue;
    // newBid.userid = req.user._id;

    // newBid.save(function(err, bidgood) {
    //     if (err) {
    //         console.log('Error in Saving bid: ' + err);
    //         throw err;
    //     }
    //     console.log('BID update succesful');
    //     Bid = bidgood._id;

    //     console.log(Bid);
    Home.find({
        "bids.bidvalue": {
            $gt: req.params.bidvalue
        }
    }, function(err, docs) {
        if (err) {
            console.log(err.status);
        } else {
            if (!docs.length) {
                console.log("Nothing higher");
                Home.findByIdAndUpdate(query, {
                    $push: {
                        "bids": {
                            bidvalue: req.params.bidvalue,
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
                            highestbidid: highestBid
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

                    }

                });
            } else {
                console.log("There is higher");
                res.json({
                    'Error': 'Not higher bid'
                });
            }
        }
    });
});




module.exports = router;