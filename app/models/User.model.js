// require npm packages
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
// user schema
var userSchema = new mongoose.Schema({
    username: String,
    password: String
});
// plugin used by user schema
userSchema.plugin(passportLocalMongoose);
// export schema to use in main app
module.exports = mongoose.model("User", userSchema);