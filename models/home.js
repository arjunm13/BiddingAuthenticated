
var mongoose = require('mongoose');

module.exports = mongoose.model('Home',{
	id: String,
	userid: String,
	address: String,
	price: String,
	squareFoot: String,
	rooms: String,
	bids: [{
		bidvalue: Number,
        userid: String
	}],
	highestbidid : String
});