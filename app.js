const express = require('express'); // require express
const mongoose = require('mongoose'); // require mongoose
const bodyParser = require('body-parser'); //require body-parser
const methodOverride = require('method-override'); // require method-override
const app = express();
var postRoutes = require('./routes/api'); // require API routing
var mainRoutes = require('./routes/main'); // require app routing
var db = require('./models'); // require our model and schema
var port = process.env.PORT || 8080;

app.use(bodyParser.json()); // use body parser to return json data to use in our API
app.use(bodyParser.urlencoded({extended:true})); // body parser
app.use(methodOverride('_method')); // method-override to handle delete requests 
app.use(express.static('public')); // host static files with express in this case the public dir.
app.use('/api/posts', postRoutes); // import API router
app.use('/',mainRoutes); // import app router
app.set("view engine", "ejs"); // set templating engine to ejs

// listen on the port
app.listen(port,function(){
    console.log('server started....');
});