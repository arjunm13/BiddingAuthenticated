var express = require('express');
var router = express.Router();
var Home = require('../models/home');
var User = require('../models/user');
var Bid = require('../models/bid');
var passport = require('passport');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var multer = require('multer');
var util = require('util');

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

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function(req, file, callback) {
        callback(null, req.user._id + '-' + Date.now() + '.' + file.originalname.split(/[. ]+/).pop());
    }
});

var uploadMulti = multer({ storage: storage }).array('userPhoto', 4);

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
var sendMail = function(homeID) {
    // Not the movie transporter!
    var houseid = homeID;
    console.log(homeID);
    var text = 'New Home has been created http://localhost:3000/homes/show/' + houseid;
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
            pass: 'XXXXX'
        }
    });
    transporter.sendMail(mailOptions, function(error, info) {
        console.log("done here 2");
        if (error) {
            console.log("done here 3");
            console.log(error);
            res.json({ yo: 'error' });
        } else {
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

    uploadMulti(req, res, function(err) {
        if (err) {
            return res.send("Error uploading file");
        } else {
            var newHome = new Home();

            var search = req.body.address + ' ' + req.body.city + ' ' + req.body.province;

            console.log("search results: " + search);

            console.log("1: " + req.param('userPhoto'));
            geocoder.geocode(search, function(err, result) {
                geocodedresult = result;


                console.log(" DEBUGGERRRRR: req.files");
                console.log(util.inspect(req.files, { showHidden: false, depth: null }));
                console.log(" DEBUGGERRRRR rreq.file");
                console.log(util.inspect(req.file, { showHidden: false, depth: null }));
                console.log(" DEBUGGERRRRR req.file and req.files");

                console.log("3: " + req.files);

                console.log("4: " + req);

                console.log(geocodedresult[0].longitude);
                var output = geocodedresult[0].latitude;
                output = output + ' ';
                output = output + geocodedresult[0].longitude;
                var lg = geocodedresult[0].longitude;
                var lt = geocodedresult[0].latitude;



                // set the user's local credentials
                newHome.userid = req.user._id;
                newHome.address = geocodedresult[0].formattedAddress;
                newHome.city = req.body.city;
                newHome.region = geocodedresult[0].administrativeLevels.level2short;
                newHome.province = req.body.province;
                newHome.price = req.body.price;
                newHome.squareFoot = req.body.squareFoot;
                newHome.rooms = req.body.rooms;
                newHome.homeType = req.body.homeType;
                newHome.saleRent = req.body.saleRent;
                newHome.bedrooms = req.body.bedrooms;
                newHome.bathrooms = req.body.bathrooms;
                newHome.bidding = req.body.BiddingActive;
                newHome.bids.bidvalue = 0;
                newHome.bids.userid = '000';
                newHome.highestbidvalue = req.body.price;
                newHome.publicTrue = false;
                newHome.loc = [lg, lt];
                // newHome.photopaths = req.param('userPhoto');

                for (var j = 0; j < req.files.length; j++) { // inner loop

                    console.log(req.files[j]);
                    console.log(req.files[j].path);
                    var pathstr = req.files[j].path;


                    newHome.photopaths.push(pathstr.slice(6));
                }
                console.log(newHome.photopaths);

                newHome.save(function(err, newHome) {
                    if (err) {
                        console.log(err);
                        return next(err);
                    }
                    //res.json(201, newHome);
                    var queryHome = newHome

                    var query = {
                        "_id": newHome._id
                    };

                    Home.findByIdAndUpdate(queryHome, {
                        $pushAll: {

                        }
                    }, {}, function(err, savedModel) {
                        if (err) {
                            return res.send(500, {
                                error: err
                            });

                        } else {

                            var email = req.user.email;

                            var query = {
                                "email": email
                            };

                            User.findOneAndUpdate(query, {
                                $push: {
                                    "homes": newHome._id
                                }
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

                                    console.log(newHome._id);
                                sendMail(newHome._id);
                                res.render('thankyouHome');




                            });

                        }
                    });




                });

            });
        }
    });


});

/* GET login page. */
router.get('/homelist',function(req, res) {

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
    var maxDistance = req.param('maxDistance');


    geocoder.geocode(area, function(err, result) {

        if (err) {
            console.log(err.status);
        } else {

            geocodedresult = result;



            var limit = 10;

            // get the max distance or set it to 8 kilometers
           // var maxDistance = 800;

            // we need to convert the distance to radians
            // the raduis of Earth is approximately 6371 kilometers
            console.log("Max:" + maxDistance);
            maxDistance /= 6378.1;
            maxDistance *= 100;

            
            console.log("Max:" + maxDistance);//maxDistance /= 10;

            // get coordinates [ <longitude> , <latitude> ]

            if (result.length == 0 | result == undefined) {
                var coords = [0, 0];
                maxDistance = maxDistance * 100;
            } else {
                console.log(result);
                var coords = [];
                coords[0] = geocodedresult[0].longitude;
                coords[1] = geocodedresult[0].latitude;

                console.log(coords[1]);
            }


            var query = {
                loc: {
                    $near: coords,
                    $maxDistance: maxDistance

                },
                squareFoot: {
                    $gt: sqft - 1
                },
                price: {
                    $gt: greaterThanPrice - 1,
                    $lt: lessThanPrice + 1
                },
                bedrooms: {
                    $gt: numOfBedrooms - 1
                },
                bathrooms: {
                    $gt: numOfBathrooms - 1
                }
            };
             // == new String("a").valueOf()
             console.log(homeType);
             var any = "Any";

            if (homeType.toString() !== any.toString()) {
                query["homeType"] = homeType;
            }
            if (saleRent.toString() !== any.toString()) {
                query["saleRent"] = saleRent;
            }
            // find a location
            console.log(query);
            Home.find(query).limit(limit).exec(function(err, homes) {
                if (err) {
                    return res.json(500, err);
                }
                var homeMap = [];
                console.log(homeMap);
                homes.forEach(function(home) {
                    homeMap.push(home);
                });

                maxDistance*=63710;
                console.log(maxDistance);
                res.render('homelistresults', {
                    homes: homeMap,
                    radius: maxDistance,
                    longitude: coords[0],
                    latitude: coords[1]
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
            agentQuery = {
                "_id" : ObjectId(homes.userid)
            }
            User.findById(agentQuery, function(err, agent){
                res.render('property', {
                agent: agent,
                home: homes,
                user: req.user
            });

            });
            
        }
    });
});

router.post('/:homeid/bid', function(req, res) {

    var homeid = req.params.homeid;
    var bidv = req.param('bidvalue');
    var url = '/homes/show/' + homeid;
   
    bidv=bidv.replace(/\,/g,''); // 1125, but a string, so convert it to number
    bidv=parseInt(bidv,10);
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
