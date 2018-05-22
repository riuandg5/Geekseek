const express = require('express');
const router = express.Router();
var db = require('../models');

// root route
router.get('/', function (req, res) {
    res.render('index');
});


// route to admin upload panel


// auth routes

router.get('/gsad/admin/register', function (req, res) {
    // res.render('admin-register');
    res.send('not allowed!!!');
});


// route for different content types
router.get('/:content', function (req, res) {
    db.post.find({ 'ctype': req.params.content }).sort({ date: -1 })
        .then(function (cposts) {
            res.render('content-view', { 'cposts': cposts });
        })
        .catch(function (err) {
            res.send(err);
        });
});

// export the router to be used in app.js
module.exports = router;