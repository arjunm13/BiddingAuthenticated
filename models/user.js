
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	id: String,
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String,
	photopath: String,
	userType: String,
	gender: String,
	birthDate: Number,
	birthMonth: String,
	birthYear: Number,
	company: String,
	address: String,
	comments: [{
		userName: String,
		userid: String,
		comment: String,
        rating: Number
	}],
	homes: [String]
});