const mongoose = require('mongoose'); // require mongoose
mongoose.set('debug', true); // mongoose debug mode true for testing purposes remove when deployinng
mongoose.Promise = Promise; // use mongoose promise library to use promises instead of nasty callbacks
const dburl = process.env.DBURL || "mongodb://localhost/geek";

mongoose.connect(dburl);
// 'post' has our model and schema
module.exports.post = require('./postmodel');
module.exports.user = require('./usermodel');