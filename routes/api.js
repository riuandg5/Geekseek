const express = require('express'); // require express
const router = express.Router(); // use express router
const db = require('../models/'); // require our model and schema
// root route of our API, shows all the uploaded posts
router.get('/',function(req,res){
    db.post.find().sort({date: -1})
    .then(function(posts){
        res.json(posts);
    })
    .catch(function(err){
        res.send(err);
    })
});

// post route of our API, will be used to upload posts to the db 
router.post('/',function(req,res){
    db.post.create(req.body)
    .then(function(newpost){
        res.status(201).redirect('/gsad/admin/view');
    })
    .catch(function(err){
        res.send(err);
    });
});

// get a single post by using its id
router.get('/:id',function(req,res){
    db.post.findById(req.params.id)
    .then(function(post){
        res.json(post);
    })
    .catch(function(err){
        res.send(err);
    });
});

// delete route of our API, will handle all delete requests
router.delete('/:id',function(req,res){
    db.post.findByIdAndRemove(req.params.id)
    .then(function(){
        res.redirect('/gsad/admin/delete');
    })
    .catch(function(err){
        res.send(err);
    })
});

// export the router to be used in app.js
module.exports = router;