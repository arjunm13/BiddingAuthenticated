var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Home = require('../models/home');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


var isAuthenticated = function(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (res.locals.login = req.isAuthenticated())
        res.locals.username = req.user.username;
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect("/users/loginPage");
}

module.exports = function(passport) {

    /* GET login page. */
    router.get('/loginPage', function(req, res) {

        if (req.user) {
            res.redirect('/homes/homelist');
        } else {
            res.render('login', { message: req.flash('message') });
        }
        // Display the Login page with any flash message, if any

    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/users/show',
        failureRedirect: '/users/loginPage',
        failureFlash: true
    }));

    /* GET Registration Page */
    router.get('/signup', function(req, res) {
        res.render('register', { message: req.flash('message') });
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/users/show',
        failureRedirect: '/users/signup',
        failureFlash: true
    }));

    /* GET Home Page */
    router.get('/show', isAuthenticated, function(req, res) {
        if (req.user.userType=="user"){
            console.log(res.locals);
            res.render('userprofilenew', { user: req.user });
        } else {

            res.redirect('/users/showagent/' + req.user._id);
        }
        
    });

    /* Handle Logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/users/loginPage');
    });


    /* Handle Logout */
    router.get('/signout', function(req, res) {
        req.logout();
        res.redirect('/users/loginPage');
    });

    /* Handle Logout */
    router.get('/newagent', function(req, res) {
        res.render('createprof');
    });


    /* Handle Logout */
    router.get('/showagent/:id', isAuthenticated,function(req, res) {

        var agentid = req.params.id;
        console.log(agentid);
        var query = {
            "_id": ObjectId(agentid)
        };
        console.log(agentid);
        User.findById(query, function(err, agents) {
            if (err) {
                console.log(err.status);
            } else {
                // res.render('agentFinal', {
                //     user: req.user.username,
                //     home: homes
                // });
                var agentID = agents._id

                var homeQuery = {
                    userid : agentID
                }
                Home.find(homeQuery, function(err, results){
                    console.log(agents.firstName);
                    console.log(results.userid);
                res.render('agentFinal', {
                    agent: agents,
                    homes: results
                });

                })
        		
            }

        });


    });

    /* GET login page. */
router.get('/agentlist', isAuthenticated,function(req, res) {

    User.find({
        "userType": "Real Estate Agent" 
    }, function(err, agents) {
        var agentMap = [];

        agents.forEach(function(agent) {
            agentMap.push(agent);
        });


        res.render('agentlist', {
            agents: agentMap
        });
        // res.json({
        //     agent: agentMap
        // });

    });
});



    router.post('/showagent/:agentid/comment', isAuthenticated, function(req, res) {

    	
        var agentid = req.params.agentid;
        var comment = req.param('comment');
        var rating = req.param('rating');
        var url = '/users/showagent/' + agentid;
        console.log(agentid);
  

        var query = {
            "_id": ObjectId(agentid)
        };

        User.findByIdAndUpdate(query, {
                    $push: {
                        "comments": {
                            comment: comment,
                            userName: req.user.username,
                            userid: req.user._id,
                            rating: rating
                        }
                    }
                }, {
            safe: true,
            upsert: true,
            new: true
        }, function(err, doc) {
            if (err)
                return res.send(500, {
                    error: err
                });
            else
            // return res.send("Successfully Saved");
            //res.json(doc);
            	console.log(doc);
                res.redirect(url);

        });



    });



    return router;
}