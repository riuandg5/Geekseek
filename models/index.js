const mongoose = require('mongoose');
mongoose.set('debug',true);
mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/geek');

module.exports.post = require('./postmodel');