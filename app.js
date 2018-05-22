const express = require('express'); // require express
const mongoose = require('mongoose'); // require mongoose
const bodyParser = require('body-parser'); //require body-parser
const methodOverride = require('method-override'); // require method-override
const passport = require('passport');
const localStrategy = require('passport-local');
const app = express();
var postRoutes = require('./routes/api'); // require API routing
var mainRoutes = require('./routes/main'); // require app routing
var db = require('./models'); // require our model and schema
var port = process.env.PORT || 8080;

app.use(bodyParser.json()); // use body parser to return json data to use in our API
app.use(bodyParser.urlencoded({ extended: true })); // body parser
app.use(methodOverride('_method')); // method-override to handle delete requests 
app.use(express.static('public')); // host static files with express in this case the public dir.
app.use('/api/posts', postRoutes); // import API router
app.use('/', mainRoutes); // import app router
app.set("view engine", "ejs"); // set templating engine to ejs

// passport config
app.use(require('express-session')({
    secret: 'geekseekisthebestwebsite',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(db.user.authenticate()));
passport.serializeUser(db.user.serializeUser());
passport.deserializeUser(db.user.deserializeUser());


// signup logic
app.post('/gsad/admin/register', function (req, res) {
    var newuser = new db.user({ username: req.body.username });
    db.user.register(newuser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render('/gsad/admin/register');
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/gsad/admin');
        });
    });
});
// login authentication logic
app.post('/gsad/admin/login', passport.authenticate('local',
    {

        successRedirect: "/gsad/admin",
        failureRedirect: "/"

    }
), (req, res) => {

});

// route to admin panel
app.get("/gsad/admin", isLoggedIn, function (req, res) {
    res.render('admin-panel');
});

// route to admin upload panel
app.get("/gsad/admin/upload", isLoggedIn, function (req, res) {
    res.render('admin-upload');
});

// route to admin view panel
app.get("/gsad/admin/view", isLoggedIn, function (req, res) {
    db.post.find().sort({ date: -1 })
        .then(function (allposts) {
            res.render('admin-view', { 'allposts': allposts });
        })
        .catch(function (err) {
            res.send(err);
        });
});

// route to admin login page
app.get('/gsad/admin/login', (req, res) => {
    res.render('admin-login')
});

// route to admin delete panel
app.get("/gsad/admin/delete", isLoggedIn, function (req, res) {
    db.post.find().sort({ date: -1 })
        .then(function (allposts) {
            res.render('admin-delete', { 'allposts': allposts });
        })
        .catch(function (err) {
            res.send(err);
        });
});

// route to admin confirm deletion panel
app.get('/gsad/admin/delete/:id', isLoggedIn, function (req, res) {
    db.post.findById(req.params.id)
        .then(function (post) {
            res.render('admin-confirm-delete', { 'post': post });
        });
});

// logout route
app.get('/gsad/admin/logout', isLoggedIn, (req, res) => {
    req.logOut();
    res.redirect('/');
});

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


// listen on the port
app.listen(port, process.env.IP, function () {
    console.log('server started....');
});
