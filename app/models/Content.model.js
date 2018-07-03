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
    fl: String,
    // get id of user logged in who created the content
    owner: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        name: String
    },
    created: {type: Date, default: Date.now}
});
// export content schema to use in main app
module.exports = mongoose.model("Content", contentSchema);