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
            req.flash("error", err.message);
            res.redirect("/gsad/signup");
        } else {
            // if signup success then redirect to mycontent
            passport.authenticate("local")(req, res, function(){
                req.flash("success", "Successfully signed up!");
                res.redirect("/mycontent");
            });
        }
    });
});
// route to signin form
router.get("/gsad/signin", function(req, res){
    res.render("signin");
});
// route to post signin form data
router.post("/gsad/signin",
    passport.authenticate(
        "local",
        {
            successRedirect: "/mycontent",
            failureRedirect: "/gsad/signin",
            failureFlash: "Signin failed!",
            successFlash: "Successfully signed in!"
        }
    ), function(req, res){
});
// route to show reset admin credentials form
router.get("/gsad/adminreset", function(req, res){
    User.find({}, function(err, admins){
        if(err){
            console.log(err);
        } else {
            res.render("adminreset", {admins: admins});
        }
    });
});
// route to reset admin credentials
router.post("/gsad/adminreset", function(req, res){
    User.findOne({username: req.body.oldname}, function(err, user){
        if(err){
            console.log(err);
        } else if(user){
            User.findOne({username: req.body.newname}, function(err, newuser){
                if(err){
                    console.log(err);
                } else if(newuser){
                    req.flash("error", "A user with the given username is already registered!");
                    res.redirect("/gsad/adminreset");
                } else {
                    User.updateOne({_id: user._id}, {$set:{username: req.body.newname}}, function(err){
                        if(err){
                            console.log(err);
                        } else {
                            user.setPassword(req.body.newpassword, function(err){
                                if(err){
                                    console.log(err);
                                } else {
                                    user.save(function(err){
                                        if(err){
                                            console.log(err);
                                        } else {
                                            Content.updateMany({"owner.id": user._id}, {$set:{"owner.name": req.body.newname}}, function(err){
                                                if(err){
                                                    console.log(err);
                                                }
                                            })
                                            Post.updateMany({"owner.id": user._id}, {$set:{"owner.name": req.body.newname}}, function(err){
                                                if(err){
                                                    console.log(err);
                                                }
                                            })
                                            req.flash("success", "Successfully transformed admin!");
                                            res.redirect("/gsad/adminreset");
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            req.flash("error", `No admin found by name : ${req.body.oldname}`);
            res.redirect("/gsad/adminreset");
        }
    });
});
// route to signout
router.get("/gsad/signout", function(req, res){
    req.logout();
    req.flash("success", "Successfully signed out!");
    res.redirect("/");
});
// export express router to use in main app
module.exports = router;