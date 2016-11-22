/**
 * http://usejsdoc.org/
 */

var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
var config = require('../config.json');
var logger = require('bunyan').createLogger({
	name:config.APP_NAME,
	level: config.LOG_LEVEL});


var STATES =  require("../models/mongodbstate.js");
//Bind mongodb connection
var mongoUrl = appEnv.getServiceURL('kaiser-users-mongodb');
var mongoService = appEnv.getService('kaiser-users-mongodb');
var mongoose = require(config.DB_SCHEMA);//'mongoose');
console.log("mongoUrl is "+mongoUrl);

var mongoose = require(config.DB_SCHEMA);//'mongoose');


var mongoDbConnection = function(callback){
	
	logger.info("--- In mongoDbConenction ----");
	
//	logger.info("--- req:"+req);
	if(mongoose.connection.readyState == STATES.disconnected){
		logger.info("==== Mongodb is disconnected , so connecting newly...");
		if (mongoUrl == null) {
			  //local development
			  mongoose.Promise = global.Promise;
			  mongoose.connect(config.LOCAL_DB,function(err,res){
				  if(err){
					  console.log("---- Mongodb error in connection ----");
					  callback(err,null);
				  }else{
					  console.log("----- Success local db ---");
					  callback(null,res);
				  }
			  });  
			} else {
			  //Bluemix cloud foundry - Compose service connection
			  //var mongooseUrl = 'mongodb://' + mongoService.credentials.user + ':' + mongoService.credentials.password + '@' + mongoService.credentials.uri + ':' + mongoService.credentials.port + '/project';
			  //var mongooseUrl = mongoService.credentials.url;
			  mongoose.Promise = global.Promise;
			  mongoose.connect(mongoUrl, function (err, res) {
				        if (err) {
				          console.log ('ERROR connecting to: ' + mongoUrl + '. ' + err);
				          callback(err,null);
				        } else {
				          console.log ('Succeeded connected ' );
				          callback(null,res);
				        }
				      });
			}
	}else{
		logger.info("==== mongodB connected already....");
		return;
	}
	
}
exports.mongoDbConnection = mongoDbConnection;