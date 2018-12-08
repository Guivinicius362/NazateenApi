const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');
const transport = nodemailer.createTransport({
	host: 'smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: '0084d017afbac8',
		pass: 'd8ee27cbdb0e40',
	},
});

transport.use(
	'compile',
	hbs({
		viewEgine: 'handlebars',
		viewPath: path.resolve('./src/resources/mail/'),
		extName: '.html',
	}),
);
module.exports = transport;
