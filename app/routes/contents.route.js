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
// tell google to use new version of rest api
var drive = google.drive({version: 'v3'});
// Jason Web Token Client method of google authentication
var jwtClient  = new google.auth.JWT(
    require("../../config/config.json").client_email || process.env.CLIENTEMAIL,
    null,
    require("../../config/config.json").private_key || process.env.PRIVATEKEY,
    ['https://www.googleapis.com/auth/drive'],
    null
);
// authorize client
jwtClient.authorize();
// id of folder to which content is uploaded
var folderId = key.folderid || process.env.FOLDERID;
// id of folder to which deleted content is moved
var deletedId = key.deletedid || process.env.DELETEDID;
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
// route to show content deleted by admin
router.get("/alldeletedbyadmin", middleware.isLoggedIn, function(req, res){
    drive.files.list({auth: jwtClient, q: "'"+[deletedId]+"'"+" in parents and mimeType!='application/vnd.google-apps.folder'"}, (listErr, resp) => {
        if(listErr){
            console.log(listErr);
            return;
       }
       res.render("alldeletedbyadmin", {files: resp.data.files});
    });
});
// route to permanently delete content (deleted by admin) by superadmin
router.post("/deletepermanently/:fid", middleware.isLoggedIn, function(req, res){
    drive.files.delete({ auth: jwtClient, fileId: req.params.fid}, (err, resp) => {
        if(err){
            console.log(err);
            return;
        }
        res.redirect("/alldeletedbyadmin");
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
    if(req.file){
        // file metadata that is name and parent folder
        var fileMetadata = {name: req.file.originalname, parents: [folderId]};
        // set file extension and file path
        var media = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream('./tempUploads/' + req.file.originalname)
        };
        // upload request
        drive.files.create({auth: jwtClient, resource: fileMetadata, media, fields: 'id'}, (err, file) => {
            if(err){
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
    } else {
        Content.create({ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info, fl: req.body.lup, owner: req.user.id}, function(err, newContent){
            if(err){
                console.log(err);
            } else {
                res.redirect("/mycontent");
            }
        });
    }
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
router.put("/:contentid/update", upload.single("fup"), function(req, res){
    Content.findById(req.params.contentid, function(err, foundContent){
        if(err){
            console.log(err);
        } else {
            if(req.file){
                if(foundContent.fid){
                	// upload new file and move old file to delete
                    drive.files.get({ auth: jwtClient, fileId: req.body.content.fid, fields: 'parents'}, (getErr, resp) => {
                        if (getErr) {
                            console.log(getErr);
                            return;
                        }
                        drive.files.update({auth: jwtClient, fileId: req.body.content.fid, removeParents: resp.data.parents[0], addParents: [deletedId], fields: 'id, parents'}, (err, oldfile) => {
                            if (err) {
                              console.log(err);
                              return;
                            }
                            // file metadata that is name and parent folder
					        var fileMetadata = {name: req.file.originalname, parents: [folderId]};
					        // set file extension and file path
					        var media = {
					            mimeType: req.file.mimetype,
					            body: fs.createReadStream('./tempUploads/' + req.file.originalname)
					        };
					        // upload request
					        drive.files.create({auth: jwtClient, resource: fileMetadata, media, fields: 'id'}, (err, file) => {
					            if(err){
					                console.log(err);
					                return;
					            }
					            Content.findByIdAndUpdate(req.params.contentid, {$set:{ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info, fid: file.data.id}}, function(err, updatedData){
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
                    // // update new version of file
                    // // file metadata that is name
                    // var fileMetadata = {name: req.file.originalname};
                    // // set file extension and file path
                    // var media = {
                    //     mimeType: req.file.mimetype,
                    //     body: fs.createReadStream('./tempUploads/' + req.file.originalname)
                    // };
                    // // update request
                    // drive.files.update({auth: jwtClient, fileId: req.body.content.fid, resource: fileMetadata, media, fields: 'id'}, (err, file) => {
                    //     if (err){
                    //         console.log(err);
                    //         return;
                    //     }
                    //     Content.findByIdAndUpdate(req.params.contentid, {$set:{ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info, fid: file.data.id}}, function(err, updatedData){
                    //         if(err){
                    //             console.log(err);
                    //         } else {
                    //             fs.unlink('./tempUploads/' + req.file.originalname, (err) => {
                    //                 if (err) throw err;
                    //             });
                    //             res.redirect("/mycontent");
                    //         }
                    //     });
                    // });
                } else if(foundContent.fl){
                    // set link null and upload file
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
                        Content.findByIdAndUpdate(req.params.contentid, {$set:{ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info, fid: file.data.id, fl: ""}}, function(err, updatedData){
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
                }
            } else if(req.body.lup){
                if(foundContent.fid){
                    // move old fileto delete and set link
                    drive.files.get({ auth: jwtClient, fileId: req.body.content.fid, fields: 'parents'}, (getErr, resp) => {
                        if (getErr) {
                            console.log(getErr);
                            return;
                        }
                        drive.files.update({auth: jwtClient, fileId: req.body.content.fid, removeParents: resp.data.parents[0], addParents: [deletedId], fields: 'id, parents'}, (err, file) => {
                            if (err) {
                              console.log(err);
                              return;
                            }
                            Content.findByIdAndUpdate(req.params.contentid, {$set:{ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info, fid: "", fl: req.body.lup}}, function(err, updatedData){
                                if(err){
                                    console.log(err);
                                } else {
                                    res.redirect("/mycontent");
                                }
                            });
                        });
                    });
                } else if(foundContent.fl){
                    // update new link
                    Content.findByIdAndUpdate(req.params.contentid, {$set:{ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info, fl: req.body.lup}}, function(err, updatedData){
                        if(err){
                            console.log(err);
                        } else {
                            res.redirect("/mycontent");
                        }
                    });
                }
            } else {
                // update other things
                Content.findByIdAndUpdate(req.params.contentid, {$set:{ctype: req.body.content.type, branch: req.body.content.forbranch, sem: req.body.content.forsem, subject: req.body.content.subject, title: req.body.content.title, info: req.body.content.info}}, function(err, updatedData){
                    if(err){
                        console.log(err);
                    } else {
                        res.redirect("/mycontent");
                    }
                });
            }
        }
    });
});
// route to delete content confirmation
router.get("/:contentid/delete", middleware.isLoggedIn, function(req, res){
    Content.findById(req.params.contentid, function(err, foundContent){
        if(err){
            console.log(err);
        } else {
            res.render("confirmdelete", {content: foundContent});
        }
    });
});
// route to delete content by admin
router.delete("/:contentid/delete/confirmed", middleware.isLoggedIn, function(req, res){
    if(req.body.content.fid){
        drive.files.get({ auth: jwtClient, fileId: req.body.content.fid, fields: 'parents'}, (getErr, resp) => {
            if (getErr) {
                console.log(getErr);
                return;
            }
            drive.files.update({auth: jwtClient, fileId: req.body.content.fid, removeParents: resp.data.parents[0], addParents: [deletedId], fields: 'id, parents'}, (err, file) => {
                if (err) {
                  console.log(err);
                  return;
                }
                Content.findByIdAndRemove(req.params.contentid, function(err){
                    if(err){
                        console.log(err);
                    }
                    res.redirect("/mycontent");
                });
            });
        });
    } else if(req.body.content.fl){
        Content.findByIdAndRemove(req.params.contentid, function(err){
            if(err){
                console.log(err);
            }
            res.redirect("/mycontent");
        });
    }
});
// export express router to use in main app
module.exports = router;