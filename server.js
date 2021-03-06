var port  = process.env.PORT || 3079,
    dburi = process.env.DBURI || "mongodb://localhost/geekseek";
// require npm packages
var bodyParser       = require("body-parser"),
    methodOverride   = require("method-override"),
    expressSanitizer = require("express-sanitizer"),
    mongoose         = require("mongoose"),
    express          = require("express"),
    flash            = require("connect-flash"),
    passport		 = require("passport"),
    LocalStrategy	 = require("passport-local"),
    app              = express();
// require models
var Content          = require("./app/models/Content.model"),
    Post 			 = require("./app/models/Post.model"),
	User             = require("./app/models/User.model");
// require routes
var	contentsRoute    = require("./app/routes/contents.route"),
    postsRoute       = require("./app/routes/posts.route"),
	indexRoute       = require("./app/routes/index.route");
// tell mongoose to use bluebird or native ES6 promise library
// mongoose.Promise = global.Promise; // native ES6 promise library
mongoose.Promise = require('bluebird');
// connect to database
mongoose.connection.openUri(dburi);
// set views directory path
app.set("views", "./app/views");
// set templating engine to ejs
app.set("view engine", "ejs");
// host static files (public directory) with express
app.use(express.static("public"));
// passport configuration
app.use(require("express-session")({
	secret: "geekseekzlob",
    cookie: {maxAge: 86400000},
	resave: false,
	saveUninitialized: false
}));
app.use(flash()); // use flash for flash messages
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// middleware to send variables to every template page
app.use(function(req, res, next){
    // set currentUser to req.user and get superadmin id
	res.locals.currentUser = req.user;
    res.locals.superAdmin  = process.env.SUPERADMIN || '5b1d6a77e267e411d4cce1a6';
    // success and error message variables for flash
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
	next();
});
// use body-parser
app.use(bodyParser.urlencoded({extended: true}));
// use express-sanitizer to sanitize request credentials
app.use(expressSanitizer());
// method-override to manipulate delete request
app.use(methodOverride("_method"));
// use routes
app.use(contentsRoute);
app.use(postsRoute);
app.use(indexRoute);
// listen to the port
app.listen(port, function(){
    console.log('Geekseek server started...');
});