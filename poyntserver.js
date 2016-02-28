var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var rp = require('bluebird');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Creating Router() object

var router = express.Router();


// Router middleware, mentioned it before defining routes.
router.use(function(err,req,res,next) {
  if(err){
      console.log(err);
  }
  next();
});

//setup the routes
var routes = require("./routes.js")(router);

// Tell express to use this router with /api before.
// You can put just '/' if you don't want any sub path before routes.
app.use("/api",router);

// Listen to this Port
app.listen(process.env.PORT || 3000,function(){
  console.log("Live at Port 3000");
});