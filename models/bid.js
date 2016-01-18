
var mongoose = require('mongoose');

module.exports = mongoose.model('Bid',{
	userid: String,
	homeid: String,
	value: Number
});