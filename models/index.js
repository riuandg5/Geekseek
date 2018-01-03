const mongoose = require('mongoose'); // require mongoose
mongoose.set('debug',true); // mongoose debug mode true for testing purposes remove when deployinng
mongoose.Promise = Promise; // use mongoose promise library to use promises instead of nasty callbacks
mongoose.connect('mongodb://localhost/geek'); // connect to data base use more secure way to hide db info in future
// 'post' has our model and schema
module.exports.post = require('./postmodel');
module.exports.user = require('./usermodel');