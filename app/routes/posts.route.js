// express router configuration
var express = require("express"),
    router  = express.Router();
// require request
var request = require("request");
// require markdown parser with full configuration
var md = require('markdown-it')({
    html: true,
    linkify: true,
    typographer: true
});
// require and use emoji plugin for markdown parser
var emoji = require('markdown-it-emoji');
md.use(emoji);
// require models
var Content = require("../models/Content.model"),
    Post    = require("../models/Post.model"),
    User    = require("../models/User.model");
// require middleware
var middleware = require("../middleware");
// blog route
router.get("/blog/posts", function(req, res){
	Post.find({}, function (err, allposts){
		if(err){
			console.log(err);
		} else {
			res.render('blog', {posts: allposts});
		}
    });
});
// route to show new post form
router.get("/blog/posts/new", function(req, res){
    res.render("blognew");
});
// route to create new post
router.post("/blog/posts/new", function(req, res){
    var result = md.render(req.body.post.postbody);
    Post.create({branch: req.body.post.forbranch, sem: req.body.post.forsem, rawbody: req.body.post.postbody, styledbody: result, owner: req.user.id}, function(err, newPost){
        if(err){
            console.log(err);
        } else {
            res.redirect("/blog/posts");
        }
    });
});
// route to edit post
router.get("/blog/posts/:id/edit", function(req, res){
	Post.findById(req.params.id, function(err, foundPost){
        if(err){
            res.redirect("/blog/posts");
        } else {
            res.render("blogedit", {post: foundPost});
        }
    });
});
// route to update post
router.put("/blog/posts/:id", function(req, res){
	req.body.post.postbody = req.sanitize(req.body.post.postbody);
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost){
        if(err){
            res.redirect("/blog/posts");
        } else {
        	var result = md.render(req.body.post.postbody);
            Post.update({_id: updatedPost._id}, {$set:{created: Date.now(), branch: req.body.post.forbranch, sem: req.body.post.forsem, rawbody: req.body.post.postbody, styledbody: result}}, function(err, updatedData){
                if(err){
                    console.log(err);
                }
            });
            res.redirect("/blog/posts");
        }
    });
});
// route to delete post
router.delete("/blog/posts/:id", middleware.isLoggedIn, function(req, res){
    Post.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/blog/posts");
    });
});
// export express router to use in main app
module.exports = router;