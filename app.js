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
app.use('/api/posts', postRoutes);
app.set("view engine", "ejs");

app.get("/gsad/admin",function(req,res){
        res.render('admin-panel');
});
app.get("/gsad/admin/upload",function(req,res){
        res.render('admin-upload');
});
app.get("/gsad/admin/view",function(req,res){
    db.post.find()
    .then(function(allposts){
        res.render('admin-view',{'allposts':allposts});
    })
    .catch(function(err){
        res.send(err);
    })
});
app.get("/gsad/admin/delete",function(req,res){
    db.post.find()
    .then(function(allposts){
        res.render('admin-delete',{'allposts':allposts});
    })
    .catch(function(err){
        res.send(err);
    })
});
app.get('/gsad/admin/delete/:id',function(req,res){
    db.post.findById(req.params.id)
    .then(function(post){
        res.render('view',{'post':post});
    });
});
app.delete('/gsad/admin/delete/:id',function(req,res){
    db.post.findByIdAndRemove(req.params.id)
    .then(function(post){
        res.redirect('/gsad/admin/delete');
    });
});
app.listen(port,function(){
    console.log('server started');
});