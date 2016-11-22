/**
 * http://usejsdoc.org/
 */

var hystrix = require('../netflix/hystrix/index.js');
var command = require('../netflix/hystrix/command.js');

module.exports = function(mongoDbService){
	
	module.hystrixStream = function(request, response){
		hystrix.hystrixStream(request, response);
	}


  module.mongoConnectionHystrix = function(arg, callback /* (error, sessionId) */){
		console.log("IN histrix-service JS : mongoConnectionHystrix....");
		//console.log("IN histrix-service JS : authService.testService is "+authService.testService);
		console.log("IN histrix-service JS : arg is "+arg);
		command.getCommand("mongoConnectionHystrix", mongoDbService.mongoDbConnection, function (error, cmd){
		console.log("IN histrix-service JS : command.getCommand....");
			if (error){
				callback (error, null);
			}
			else{
				console.log("IN histrix-service JS : execute");				
				//cmd.execute(arg, callback);
				cmd.execute(callback);
			}
		});
	};
	return module;
}
//exports.mongoConnectionHystrix = mongoConnectionHystrix;