// express router configuration
var express = require("express"),
    router  = express.Router();
// require request
var request = require("request");
// require multer for handling file upload
var multer = require("multer");
// configure multer storage values
// store to temp folder and name file as original name
var storage = multer.diskStorage({
    destination: "./tempUploads",
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});
// middleware to call multer and upload with storage configuration
var upload = multer({storage: storage});
// require fs to handle local file operations
var fs = require("fs");
// require googleapis to handle drive api requests
var {google} = require("googleapis");
// require google authentication key
var key = require("../config/config.json");
// tell google to use new version of rest api
var drive = google.drive({version: 'v3'});
// Jason Web Token Client method of google authentication
var jwtClient  = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive'],
    null
);
// require models
var Content = require("../models/Content.model"),
    Post    = require("../models/Post.model"),
    User    = require("../models/User.model");
// require middleware
var middleware = require("../middleware");
// mycontent route
router.get('/mycontent', middleware.isLoggedIn, function (req, res){
    Content.find({}, function(err, allContent){
        if(err){
            console.log(err);
        } else {
            res.render("content", {contents: allContent, ctitle: "mycontent"});
        }
    });
});
// content route
router.get('/:content', function (req, res){
    Content.find({'ctype': req.params.content}, function(err, reqContent){
    	if(err){
    		console.log(err);
    	} else {
    		res.render("content", {contents: reqContent, ctitle: req.params.content});
    	}
    });
});
// route to upload new content form
router.get('/gsad/upload', middleware.isLoggedIn, function (req, res){
    res.render("upload");
});
// route to upload new content
router.post('/gsad/upload', upload.single("fup"), function (req, res){
    // upload to google
    jwtClient.authorize(function(authErr){
        if(authErr){
            console.log(authErr);
            return;
        }
        // id of folder to which content is uploaded
        var folderId = process.env.FOLDERID || '1-jkAMYjcv3u9ZH-tUif2rvovgLCY7pDS';
        // file metadata that is name and parent folder
        var fileMetadata = {name: req.file.originalname, parents: [folderId]};
        // set file extension and file path
        var media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream('./tempUploads/' + req.file.originalname)
        };
        // upload request
        drive.files.create({auth: jwtClient, resource: fileMetadata, media, fields: 'id'}, (err, file) => {
            if (err){
                console.log(err);
                return;
            }
            Content.create({ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info, fid: file.data.id, owner: req.user.id}, function(err, newContent){
                if(err){
                    console.log(err);
                } else {
                    fs.unlink('./tempUploads/' + req.file.originalname, (err) => {
                        if (err) throw err;
                    });
                    res.redirect("/mycontent");
                }
            });
        });
    });
});
// route to edit content
router.get("/:contentid/edit", middleware.isLoggedIn, function(req, res){
    Content.findById(req.params.contentid, function(err, foundContent){
        if(err){
            console.log(err);
        } else {
            res.render("contentedit", {content: foundContent});
        }
    });
});
// route to update content
router.put("/:contentid/update", middleware.isLoggedIn, function(req, res){
    Content.findByIdAndUpdate(req.params.contentid, {$set:{ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info}}, function(err, updatedData){
        if(err){
            console.log(err);
        } else {
            res.redirect("/mycontent");
        }
    });
});
// route to delete content
router.delete("/:contentid/delete", middleware.isLoggedIn, function(req, res){
    Content.findByIdAndRemove(req.params.contentid, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/mycontent");
    });
});
// export express router to use in main app
module.exports = router;