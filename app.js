const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();
var postRoutes = require('./routes/routes');
var db = require('./models');
var port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set("view engine", "ejs");

app.get("/",function(req,res){
    db.post.find()
    .then(function(posts){
        res.render('index',{'posts':posts});
    });
});

app.use('/api/posts', postRoutes);
app.get('/:id',function(req,res){
    db.post.findById(req.params.id)
    .then(function(post){
        res.render('view',{'post':post});
    });
});
app.delete('/:id',function(req,res){
    db.post.findByIdAndRemove(req.params.id)
    .then(function(post){
        res.redirect('/')
    });
});
app.listen(port,function(){
    console.log('server started');
});