// require npm packages
var mongoose = require("mongoose");
// content schema
var contentSchema = new mongoose.Schema({
    ctype: String,
    branch: String,
    sem: String,
    subject: String,
    title: String,
    info: String,
    fid: String,
    // get id of user logged in who created the content
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    created: {type: Date, default: Date.now}
});
// export content schema to use in main app
module.exports = mongoose.model("Content", contentSchema);