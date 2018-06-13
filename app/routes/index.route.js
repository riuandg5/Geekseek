// express router configuration
var express = require("express"),
    router  = express.Router();
// require passport for authentication
var passport = require("passport");
// require request
var request  = require("request");
// require models
var Content = require("../models/Content.model"),
    Post    = require("../models/Post.model"),
    User    = require("../models/User.model");
// require middleware
var middleware = require("../middleware");
// root route
router.get("/", function(req, res){
    res.render("home"); 
});
// route to signup form
router.get("/gsad/signup", function(req, res){
    res.render("signup"); 
});
// route to post signup form data to database and register user
router.post("/gsad/signup", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
        }
        // if signup success then redirect to mycontent
        passport.authenticate("local")(req, res, function(){
            res.redirect("/mycontent");
        });
    });
});
// route to signin form
router.get("/gsad/signin", function(req, res){
    res.render("signin");
});
// route to post signin form data
router.post("/gsad/signin", passport.authenticate("local", {successRedirect: "/mycontent", failureRedirect: "/signin"}), function(req, res){
});
// route to signout
router.get("/gsad/signout", middleware.isLoggedIn, function(req, res){
    req.logout();
    res.redirect("/");
});
// export express router to use in main app
module.exports = router;