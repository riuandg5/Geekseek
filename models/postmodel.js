const mongoose = require('mongoose'); // require mongoose

// schema definition
var postSchema = new mongoose.Schema({
    title:String, // title of uploaded post
    ctype:String,
    subject:String, // subject of the uploaded post eg. maths, eee etc..
    uploaded_by:String, // uploader of the content
    info:String, // info about the content being uploaded
    link:String, // link to the content
    // date of upload
    date:{
        type:Date,
        default :Date.now() // default value will be current date and time.\
    }
});

// convert schema to model
var Post = mongoose.model("Post",postSchema);

// export our model to index.js (in same dir.)
module.exports = Post;