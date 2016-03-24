
var mongoose = require('mongoose');

module.exports = mongoose.model('Home',{
	id: String,
	userid: String,
	address: String,
	price: Number,
	squareFoot: Number,
	bedrooms: String,
	bathrooms: Number,
	homeType: String,
	city: String,
	region: String,
	province: String,
	saleRent: String,
	postalcode: String,
	hasPhotos: Boolean,
	bidding: Boolean,
	loc: {
    type: [Number],  // [<longitude>, <latitude>]
    index: '2d'      // create the geospatial index
    },
	// bedrooms: [{
	// 	type: String,
	// 	size: {
	// 		width: Number,
	// 		length: Number
	// 	}
	// }],
	bids: [{
		bidvalue: Number,
        userid: String
	}],
	highestbidid : String,
	highestbidvalue : Number,
	publicTrue : Boolean,
	photopath: String

});