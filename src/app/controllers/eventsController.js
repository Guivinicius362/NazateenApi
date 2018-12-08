const express = require('express');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

router.use(authMiddleware);
router.get('/events', (req, res) => {
	res.send({ message: 'eventos', user: req.userId });
});

module.exports = app => app.use('/api', router);
