const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const crypto = require('crypto');
const authConfig = require('../../config/auth');
const mailer = require('../../config/mailer');

const router = express.Router();
function generateToken(params = {}) {
	return jwt.sign(params, authConfig.secret, {
		expiresIn: 9999999,
	});
}
router.post('/register', async (req, res) => {
	const { email } = req.body;
	try {
		if (await User.findOne({ email }))
			return res.status(400).send({ message: 'Já existe esse Email' });

		const user = await User.create(req.body);

		user.password = undefined;
		res.send({ user, token: generateToken({ id: user.id }) });
	} catch (err) {
		return res.status(400).send({ error: err });
	}
});
router.post('/authenticate', async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email }).select('+password');

	if (!user) return res.status(400).send({ message: 'Usuario não encontrado' });
	if (!(await bcrypt.compare(password, user.password))) {
		return res.status(400).send({ message: 'Senha invalida' });
	}

	user.password = undefined;
	res.send({ user, token: generateToken({ id: user.id }) });
});
router.post('/forgot_password', async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user)
			return res.status(400).send({ message: 'Usuario não encontrado' });
		const token = crypto.randomBytes(20).toString('hex');

		const now = new Date();
		now.setHours(now.getHours() + 1);

		await User.findByIdAndUpdate(user.id, {
			$set: {
				passwordResetToken: token,
				passwordResetExpires: now,
			},
		});

		mailer.sendMail(
			{
				to: email,
				from: 'guivinicius@gmail.com',
				template: 'auth/forgot_password',
				context: { token },
			},
			err => {
				if (err) return;
				return res.send;
			},
		);
	} catch (err) {}
});

router.post('/reset_password', async (req, res) => {
	const { email, token, password } = req.body;
	const user = await User.findOne({ email }).select(
		'+passwordResetToken passwordResetExpires',
	);

	try {
		if (!user)
			return res.status(400).send({ message: 'Usuario não encontrado' });
		if (token !== user.passwordResetToken) return console.log(token);
		const now = new Date();
		if (now > user.passwordResetExpires) return console.log('data');
		user.password = password;

		await user.save();
		res.send();
	} catch (err) {
		console.log(err);
	}
});
module.exports = app => app.use('/auth', router);
