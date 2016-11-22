/*******************************************************************************
* Copyright (c) 2015 IBM Corp.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*******************************************************************************/

var config = require('../config.json');
var logger = require('bunyan').createLogger({
	name:config.APP_NAME,
	level: config.LOG_LEVEL});

//module.exports = function (authService,settings) {
module.exports = function () {
    var module = {};
	var hystrix = require('../netflix/hystrix/index.js');
	var command = require('../netflix/hystrix/command.js');
	var validateLDAP =new require("../routes/ldap.js");

	module.hystrixStream = function(request, response){
		logger.info("----- In hystrixStream ----");
		hystrix.hystrixStream(request, response);
	}

	module.validateLDAPuser = function(req, callback /* (error, sessionId) */){
		 logger.info("----- In MicroTestSvc validateLDAPuser ----");
		 validateLDAP.validateLDAPUser(req, function (error, resp){
			 logger.info("---- req:"+req);
			if (error){
				logger.error("----- Error ----");
				callback (error, null);
			}
			else{
				logger.info("----- execute command ----");
				callback(null,resp);
			}
		});
	}
	
	return module;
}
//exports.mongoDbConnection = mongoDbConnection;


