const mongoose = require('../../config/database');
const bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true,
	},
	password: {
		type: String,
		select: false,
	},
	email: {
		type: String,
	},
	name: {
		type: String,
	},
	passwordResetToken: {
		type: String,
		select: false,
	},
	passwordResetExpires: {
		type: Date,
		select: false,
	},
});

UserSchema.pre('save', async function(next) {
	const hash = await bcrypt.hash(this.password, 8);
	this.password = hash;
	next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
