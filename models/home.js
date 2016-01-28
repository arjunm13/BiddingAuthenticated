
var mongoose = require('mongoose');

module.exports = mongoose.model('Home',{
	id: String,
	userid: String,
	address: String,
	price: String,
	squareFoot: String,
	rooms: String,
	type: String,
	city: String,
	province: String,
	loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
    },

	bedrooms: [{
		type: String,
		size: {
			width: Number,
			length: Number
		}
	}],
	bids: [{
		bidvalue: Number,
        userid: String
	}],
	highestbidid : String,
	highestbidvalue : Number
});