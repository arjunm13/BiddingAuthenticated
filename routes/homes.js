var express = require('express');
var router = express.Router();
var Home = require('../models/home');
var User = require('../models/user');
var Bid = require('../models/bid');
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

// geocoder
var geocoderProvider = 'google';
var httpAdapter = 'https';

//Email
var nodemailer = require('nodemailer');


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
    res.render('loginError');
}

//Mail function 
var sendMail = function(homeID) {
    // Not the movie transporter!
    var houseid =homeID;
    console.log(homeID);
    var text = 'New Home has been created http://localhost:3000/homes/show/'+ houseid ;
    var mailOptions = {
    from: 'arjunmahen13@gmail.com', // sender address
    to: 'eroppong@gmail.com, gjhandi@ryerson.ca, arjun.mahendran@ryerson.ca', // list of receivers
    subject: 'From EDP Server', // Subject line
    text: text //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
};
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
    };
});
    console.log("done here 1");
    };




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
        console.log(geocodedresult[0].administrativeLevels.level2short);
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
        newHome.region = geocodedresult[0].administrativeLevels.level2short;
        newHome.province = req.param('province');
        newHome.price = req.param('price');
        newHome.squareFoot = req.param('squareFoot');
        newHome.rooms = req.param('rooms');
        newHome.homeType = req.param('homeType');
        newHome.saleRent = req.param('saleRent');
        newHome.bedrooms = req.param('bedrooms');
        newHome.bathrooms = req.param('bathrooms');
        newHome.bidding = req.param('BiddingActive');
        newHome.bids.bidvalue = 0;
        newHome.bids.userid = '000';
        newHome.highestbidid = '000';
        newHome.publicTrue = false;
        newHome.loc = [lg, lt];



        newHome.save(function(err, newHome) {
            if (err) {
                console.log(err);
                return next(err);
            }
            //res.json(201, newHome);
            var email = req.user.email;

            var query = {
                "email": email
            };

            User.findOneAndUpdate(query, {
                    $push: {
                        "homes": newHome._id                    }
                },{
                            upsert: true
                        }, function(err, doc) {
                            if (err)
                                return res.send(500, {
                                    error: err
                                });
                            else
                            // return res.send("Successfully Saved");
                            //res.json(doc);
                                console.log(newHome._id);
                                sendMail(newHome._id);
                                res.render('thankyouHome');

                        });
            
        });

    });
});

/* GET login page. */
router.get('/homelist', isAuthenticated, function(req, res) {

    Home.find({
        "publicTrue": true
    }, function(err, homes) {
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
router.get('/search', function(req, res) {

    var area = req.param('searcharea');
    var homeType = req.param('homeType');
    var saleRent = req.param('saleRent');
    var greaterThanPrice = req.param('gtPrice');
    var lessThanPrice = req.param('ltPrice');
    var numOfBedrooms = req.param('numOfBedrooms');
    var numOfBathrooms = req.param('numOfBathrooms');
    var sqft = req.param('squareFoot');;
    var bidding = req.param('BiddingActive');

    console.log(area); 
    console.log(homeType);
     console.log(saleRent); 
     console.log(greaterThanPrice);
     console.log(lessThanPrice); 
     console.log(numOfBedrooms); 
     console.log(numOfBathrooms);
     console.log(sqft);
     console.log(bidding);

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
            
            if(result.length == 0 |result == undefined ){
                    var coords = [0,0];
                    maxDistance = maxDistance*1000;
            }else {
                console.log(result);
                var coords = [];
            coords[0] = geocodedresult[0].longitude;
            coords[1] = geocodedresult[0].latitude;

            console.log(coords[1]);
            }
            // find a location
            Home.find({
                loc: {
                    $near: coords,
                    $maxDistance: maxDistance
                 },
                squareFoot: {
                    $gt: sqft-1
                },
                price: {
                    $gt: greaterThanPrice -1,
                     $lt: lessThanPrice+1
                 }
                // bidding: bidding,
                // saleRent: saleRent,
                // homeType: homeType,
                // bedrooms: {
                //     $gt: numOfBedrooms
                // },
                // bathrooms: {
                //     $gt: numOfBathrooms
                // },                
                // squareFoot: {
                //     $gt: sqft
                // }
                // type: "condoApt",
                // hasPhotots: false,
                // bedrooms: {
                //     $size: 0
                // }



            }).limit(limit).exec(function(err, homes) {
                if (err) {
                    return res.json(500, err);
                }
                var homeMap = [];
                console.log(homeMap);
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
                user: req.user.username,
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