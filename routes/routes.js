const express = require('express');
const router = express.Router();
const db = require('../models/')
router.get('/',function(req,res){
    db.post.find()
    .then(function(posts){
        res.json(posts);
    })
    .catch(function(err){
        res.send(err);
    })
});
router.post('/',function(req,res){
    db.post.create(req.body)
    .then(function(newpost){
        res.status(201).json(newpost);
    })
    .catch(function(err){
        res.send(err);
    });
})
module.exports = router;