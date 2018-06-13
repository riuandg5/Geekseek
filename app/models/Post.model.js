// require npm packages
var mongoose = require("mongoose");
// post schema
var postSchema = new mongoose.Schema({
	branch: String,
    sem: String,
    rawbody: String,
    styledbody: String,
    // get id of user logged in who created the post
    owner: {
    	type: mongoose.Schema.Types.ObjectId,
    	ref: "User"
    },
    created: {type: Date, default: Date.now}
});
// export post schema to use in main app
module.exports = mongoose.model("Post", postSchema);