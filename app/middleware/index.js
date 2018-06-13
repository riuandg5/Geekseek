// array of all middlewares
var middlewareObj = {};
// middleware to check if user is logged in or not
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next(); // if logged in then proceed
	} else {
		res.redirect("/gsad/signin"); // if not logged in then redirect to login first
	}
}
// export the array of middlewares to use in main app
module.exports = middlewareObj;