//------------------------------------------------------------------------------
// Project Intake Security API 
//------------------------------------------------------------------------------

//suppress ssl eerors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// This application uses express as its web server
var express = require("express");
// create a new express server
var app = express();

// Enable reverse proxy support in Express. This causes the
// the "X-Forwarded-Proto" header field to be trusted so its
// value can be used to determine the protocol. See 
// http://expressjs.com/api#app-settings for more details.
app.enable("trust proxy");

// body parser
var bodyParser = require("body-parser");
//path
var path = require("path");
//Added for checking jsonwebtoken
var jwt = require("jsonwebtoken");
// cfenv provides access to your Cloud Foundry environment
var cfenv = require("cfenv");
var config = require("./config.json");

var cors = require("cors");
// get the app environment from Cloud Foundry
// Node server details
var appEnv = cfenv.getAppEnv();
var port = appEnv.port || "8001";
var routeUrl =  appEnv.bind || "localhost";
var appName = appEnv.name || "security-api";
var serverdomain = process.env.serverdomain || "mybluemix.net";
var hostName = appName + "." + serverdomain;
var vipAddr = process.env.vipAddress || "security-api-client.mybluemix.net";
var eurekaServer = process.env.eurekaServer || "localhost";
var eurekaPort = process.env.eurekaPort || 80;
var statusUrl = process.env.statusUrl  || "http://localhost:8001";

//LINT_FIX_17Nov2016
var logger = require("bunyan").createLogger({
	name:config.APP_NAME,
	level: config.LOG_LEVEL});


//console.log('port:'+port);
//console.log('routeUrl:'+routeUrl);
//console.log('appName:'+appName);
//console.log('hostName:'+hostName);
//console.log('serverdomain:'+serverdomain);
//console.log('vipAddr:'+vipAddr);
//console.log('eurekaServer:'+eurekaServer);
//console.log('eurekaPort:'+eurekaPort);
//console.log('statusUrl:'+statusUrl);

//eureka 
/* const Eureka = require("eureka-js-client").Eureka; */

// example configuration 
/*const client = new Eureka({
	instance: {
		app: appName,
		hostName: hostName,
		ipAddr: "127.0.0.1",
		port: {
			"$": process.env.PORT || "8001",
			"@enabled": true,
		},
		vipAddress: vipAddr,
		dataCenterInfo: {
			"@class": "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
			name: "MyOwn",
		},
		statusPageUrl: statusUrl,
	},
	eureka: {
		host: eurekaServer,
		port: eurekaPort,
		servicePath: "/eureka/apps/",
	},
}); */

/*client.logger.level("debug");*/

/*client.start((error) => {
	logger.info(error || "complete");
});*/

// Bind mongodb connection
var mongoUrl = appEnv.getServiceURL("kaiser-users-mongodb");
var mongoose = require("mongoose");//'mongoose');
//logger.info("mongoUrl is "+mongoUrl);
if (mongoUrl == null) {
  //local development
	mongoose.Promise = global.Promise;
	//mongoose.connect(config.LOCAL_DB);
	mongoose.connect(config.LOCAL_DB, {db:{safe:false}});  	  
} else {
  //Bluemix cloud foundry - Compose service connection
  //var mongooseUrl = 'mongodb://' + mongoService.credentials.user + ':' + mongoService.credentials.password + '@' + mongoService.credentials.uri + ':' + mongoService.credentials.port + '/project';
  //var mongooseUrl = mongoService.credentials.url;
	mongoose.Promise = global.Promise;
//	mongoose.connect(mongoUrl, function (err, res) {
	mongoose.connect(mongoUrl,{db:{safe:false}}, function (err, res) {	
	        if (err) {
	          logger.error("ERROR connecting to: " + mongoUrl + ". " + err);
	        } else {
	          logger.info("Succeeded connected " );
	        }
	      });
}

// enables CORS on preflight requests
app.options("*", cors());
// enables CORS on all other requests
app.use("/", cors());

//JSON body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended:true
}));

// Add a handler to inspect the req.secure flag (see 
// http://expressjs.com/api#req.secure). This allows us 
// to know whether the request was via http or https.
app.use (function (req, res, next) {
	if (req.secure) {
                // request was via https, so do no special handling
		next();
	} else {
                // request was via http, so redirect to https
		res.redirect("https://" + req.headers.host + req.url);
	}
});

// Allow static files in the /public directory to be served
//app.use(express.static(__dirname + '/public'));

// For index.html
app.use(express.static(path.join(__dirname, "www")));


//eureka code
app.get("/info", function (req, res) {
	res.status(200).send("Response from security-api microservice at "+getDateTime());
  // appInfo.application.instance contains array of instances 
  //  var appInfo = client.getInstancesByVipAddress('security-api');
  //  console.log(appInfo);
});

//user route. MVP1 until LDAP is configured for groups
var user =  require("./routes/user.js")(app);

//authentication route
var authentication =  require("./routes/auth.js")(app);

//eureka code
app.get("/deregister-eureka", function (req, res) {
	client.stop((error) => {
	  if(!error){
		  res.status(200).send("Client successfully deregistered");
	  }else{
		  res.status(404).send("Oops... some error occured");
	  }
	});  
});

app.get("/service-instances/:applicationName", function (req, res) {
	res.status(200).send(client.getInstancesByAppId(req.params.applicationName));
});

// start server on the specified port and binding host
app.listen(port, routeUrl, function() {
	logger.info("server starting on " + routeUrl + ":" + port);
});

function getDateTime() {
	var date = new Date();
	var hour = date.getHours();
	hour = (hour < 10 ? "0" : "") + hour;
	var min  = date.getMinutes();
	min = (min < 10 ? "0" : "") + min;
	var sec  = date.getSeconds();
	sec = (sec < 10 ? "0" : "") + sec;
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	month = (month < 10 ? "0" : "") + month;
	var day  = date.getDate();
	day = (day < 10 ? "0" : "") + day;
	return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
}

//export app for supertest 
module.exports = app;
