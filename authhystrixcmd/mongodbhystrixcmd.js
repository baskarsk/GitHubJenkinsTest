/**
 * http://usejsdoc.org/
 */

var hystrix = require("../netflix/hystrix/index.js");
var command = require("../netflix/hystrix/command.js");
var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name:config.APP_NAME,
	level: config.LOG_LEVEL});

module.exports = function(mongoDbService){
	
	module.hystrixStream = function(request, response){
		hystrix.hystrixStream(request, response);
	};


	module.mongoConnectionHystrix = function(arg, callback /* (error, sessionId) */){
		logger.info("IN histrix-service JS : mongoConnectionHystrix....");
		//console.log("IN histrix-service JS : authService.testService is "+authService.testService);
		logger.info("IN histrix-service JS : arg is "+arg);
		command.getCommand("mongoConnectionHystrix", mongoDbService.mongoDbConnection, function (error, cmd){
			logger.info("IN histrix-service JS : command.getCommand....");
			if (error){
				callback (error, null);
			}
			else{
				logger.info("IN histrix-service JS : execute");				
				//cmd.execute(arg, callback);
				cmd.execute(callback);
			}
		});
	};
	return module;
};
//exports.mongoConnectionHystrix = mongoConnectionHystrix;