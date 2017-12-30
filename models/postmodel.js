const mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
    name:String,
    subject:String,
    link:String,
    title:String,
    info:String,
    date:{
        type:Date,
        default :Date.now()
    }
});

var Post = mongoose.model("Post",postSchema);

module.exports = Post;