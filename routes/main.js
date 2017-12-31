const express = require('express');
const router = express.Router();
var db = require('../models');

// root route
router.get('/',function(req,res){
    res.render('index');
});

// route to admin panel
router.get("/gsad/admin",function(req,res){
    res.render('admin-panel');
});

// route to admin upload panel
router.get("/gsad/admin/upload",function(req,res){
    res.render('admin-upload');
});

// route to admin view panel
router.get("/gsad/admin/view",function(req,res){
    db.post.find().sort({date: -1})
    .then(function(allposts){
        res.render('admin-view',{'allposts':allposts});
    })
    .catch(function(err){
        res.send(err);
    });
});

// route to admin delete panel
router.get("/gsad/admin/delete",function(req,res){
    db.post.find().sort({date: -1})
    .then(function(allposts){
        res.render('admin-delete',{'allposts':allposts});
    })
    .catch(function(err){
        res.send(err);
    })
});

// route to admin confirm deletion panel
router.get('/gsad/admin/delete/:id',function(req,res){
    db.post.findById(req.params.id)
    .then(function(post){
        res.render('admin-confirm-delete',{'post':post});
    });
});

// export the router to be used in app.js
module.exports = router;