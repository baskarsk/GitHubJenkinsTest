/**
 * http://usejsdoc.org/
 */

var moment = require("moment");
var jwt =  require("jsonwebtoken");
var user = require("../models/user.js");
var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name:config.APP_NAME,
	level: config.LOG_LEVEL});

//var jwtSecret = process.env.secretKey; // this has to be in process environment var
var jwtSecret = (process.env.SECRET_KEY ? process.env.SECRET_KEY : config.SECRET_KEY);

var encryptionType = config.JSONENCRYPTION;

exports.generateToken = function(req,callback) {
	logger.info("==== In sendToken ====");
	var expires = moment().add(1, "h").valueOf();
	logger.info("expire value:"+expires);

	logger.info("==== email and group:"+req);
	var token = jwt.sign({
    	iss:req,
		exp: expires
    	}, jwtSecret,{ algorithm: encryptionType });
	logger.info("token value:"+token);
	return callback(null,token); 		
};

exports.verifyToken = function(req,callback) {
	logger.info("==== In verifyToken ===");
	var token = req.headers["x-access-token"];
	logger.info("receivedToken:"+token);
	
	 if (typeof(token) == "undefined") {
		 //res.json({info: 'no-access-token'});
	        var error= "no-access-token";
	        return callback(error,null);

	 }
	 
	 jwt.verify(token,jwtSecret,function(err,decoded){
		 		
		   if (err) {
			   logger.info("can-not-verify-token");
	            err = "can-not-verify-token";
	            return callback(err,null);
	        }
		 
		 if (decoded.exp < moment().valueOf()) {
	        // var error = new Error();
	         //err.custom = 'token-expired';
			 //res.json({info: 'token-expired'});
			 logger.info("token-expired");
			 err = "token-expired";
	         return callback(err,null);
	     }
		 
		 
		 var recvdVal = JSON.stringify(decoded.iss);
		 logger.info("recvdVal is "+recvdVal);
 		var _id = JSON.parse(recvdVal)._id;
 		var group = JSON.parse(recvdVal).group;
 		logger.info("--- email:"+_id);
 		logger.info("---- group:"+group);
 		 user.find({"_id":_id},{"_id":false,"tokenValidity":true},function(err, res) { 
    		   
    		   if (err) {
	             
    			   error =err;
    			   return callback(err,null);
	           }
	           if (res) {
	        	   var strJsonRes = JSON.stringify(res);
	        	   logger.info("---- strJsonRes:"+strJsonRes);
	        	   var tokenValue = JSON.parse(strJsonRes)[0].tokenValidity;
	           
	        	   if(tokenValue == true)
	        		   {
	        		   	return callback(null, decoded);
	        		   }
	        	   else
	        		   {return callback("Token validity is over...",null);}
	           }
 		 	});
	 });
		 
//		 console.log("DECODED IS "+decoded);
//		 return callback(null, user);
//		 });
		 
}; 

