const mongoose = require('mongoose');
mongoose.connect('mongodb://gui@localhost:27017');
mongoose.Promise = global.Promise;
module.exports = mongoose;
