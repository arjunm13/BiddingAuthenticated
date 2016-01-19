
var mongoose = require('mongoose');

module.exports = mongoose.model('Bid',{
	bidvalue : Number ,
	userid : String 
});


