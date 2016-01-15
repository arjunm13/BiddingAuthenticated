var express = require('express');
var router = express.Router();

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('loginError');
}

module.exports = function(passport){

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
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/users/show',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/show', isAuthenticated, function(req, res){
		res.render('showUser', { user: req.user });
	});

	/* Handle Logout */
	router.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/users/loginPage');
	});

	return router;
}





