var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shiftRequestsSchema = new Schema({
	shiftDate: Date,
	shiftTime: String,
	comments: String,
	applicantName: String,
	applicantPhoneNumber: String,
	requestDate: Date
});

mongoose.model('shiftRequests', shiftRequestsSchema);
