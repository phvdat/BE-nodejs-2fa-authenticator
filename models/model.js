const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
	fullname: {
		required: true,
		type: String
	},
	email: {
		required: true,
		type: String
	},
	password: {
		required: true,
		type: String
	},
	secret: {
		required: false,
		type: String
	},
	twoFactorEnable: {
		required: false,
		type: Boolean,
	}
})

module.exports = mongoose.model('Data', dataSchema)