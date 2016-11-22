/**
 * http://usejsdoc.org/
 */

var config = require('../config.json');
var logger = require('bunyan').createLogger({
	name:config.APP_NAME,
	level: config.LOG_LEVEL});

var hystrix = require('../netflix/hystrix/index.js');
var command = require('../netflix/hystrix/command.js');

module.exports = function(microserviceTestSvc){
	
	module.hystrixStream = function(request, response){
		hystrix.hystrixStream(request, response);
	}


  module.microserviceHystrixCmd = function(req, callback /* (error, sessionId) */){
		logger.info("IN histrix-service JS : microserviceHystrixCmd....");
		//console.log("IN histrix-service JS : authService.testService is "+authService.testService);
		logger.info("IN histrix-service JS : req is "+req);
		command.getCommand("microserviceHystrixCmd", microserviceTestSvc.validateLDAPuser, function (error, cmd){
		logger.info("IN histrix-service JS : command.getCommand....");
			if (error){
				logger.error("--- error scenario ---");
				callback (error, null);
			}
			else{
				logger.info("IN histrix-service JS : execute");				
				//cmd.execute(arg, callback);
				cmd.execute(req,callback);
			}
		});
	};
	return module;
}
//exports.mongoConnectionHystrix = mongoConnectionHystrix;