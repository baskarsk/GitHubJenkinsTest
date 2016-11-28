

/**
 * http://usejsdoc.org/
 */

//var querystring = require('querystring');

var request = require("request");

var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name: config.APP_NAME,
	level: config.LOG_LEVEL
});

exports.validateLDAPUser = function (req, callback) {
	logger.info("--- In validateLDAPUser ---");
	var loginId = req.body._id;
	var loginIdUCase = loginId.toUpperCase();
	var serviceUrl = process.env.serviceUrl;
	var apiKey = process.env.apiKey;
	var organization = process.env.organization;
	var authdomain = process.env.authdomain;
	var firstAuthRequestURL = serviceUrl + "/auth/ldap";
	logger.info("--- loginId ---" + loginId);
	logger.info("--- loginIdUCase ---" + loginIdUCase);
	logger.info("---- serviceUrl:" + serviceUrl);
	logger.info("---- apiKey:" + apiKey);
	logger.info("---- organization:" + organization);
	logger.info("---- authdomain:" + authdomain);
	logger.info("firstAuthRequestURL:" + firstAuthRequestURL);

	//Headers for POST call
	var headers = {
		apiKey: apiKey
	};

	//This API will initiate the authentication to providers. 
	//Checks if any prehooks are available for provider.
	//Here we are handling only for without prehooks. 
	//If response says any prehooks available then throw the message
	request({
		url: firstAuthRequestURL, //URL to hit
		method: "POST",
		headers: headers
	}, function (error, response, body) {
		if (error) {
			logger.error("---- error scenario:" + error);
			//res.send(400, JSON.stringify(error));
			callback(error, null); // Added callback and removed console log for error,instead of res.send - 20Oct2016
		}
		else if (response.statusCode == 302 || response.statusCode == 303) {
			var responseBody = JSON.parse(body);
			var checkNextCall = "/generateOtp";

			if (responseBody.nextCall == checkNextCall) {
				callback(null, { statusCode: response.statusCode, message: "There are some prehooks available for provider. This sample template application cannot proceed further" });
			}
			//If nextCall is /ldap then process the second request /ldap with the token received in body of previous /auth/ldap call
			else if (responseBody.nextCall == "/ldap") {
				//callback(null,{message:'response from http'+responseBody});
				logger.info("--- In /ldap ---");
				var secondAuthRequestURL = serviceUrl + responseBody.nextCall;
				headers.token = responseBody.token;

				if (headers.dn == null) {
					logger.info("==== dn is NULL ====");
					if (organization == "Kaiser") {
						logger.info("==== In KAISER ORG ====");
						headers.dn = loginIdUCase + "@" + authdomain;
					} else if (organization == "Cognizant") {
						logger.info("==== In COGNIZANT ORG ====");
						var namefromEmail = loginId.split("@");
						headers.dn = "cn=" + namefromEmail[0] + config.CTSLDAP;
						logger.info("==== headers.dn:::" + headers.dn);
					} else {
						headers.dn = loginId;
					}
				}

				if (headers.password == null) {
					headers.password = req.body.password;
				}

				logger.info("--- headers.dn: ---:" + headers.dn);
				//logger.info("---- headers.password ---:" + headers.password );

				request({
					url: secondAuthRequestURL, //URL to hit
					method: "POST",
					headers: headers
					//,json : body //28Oct2016
				}, function (error, response, body) {
					if (error) {
						logger.error("---- Error in secondAuthURL : validateLDAPUser ---" + error);
						//res.send(400, error);
						callback(error, null);
					}
					else if (response.statusCode == 302 || response.statusCode == 303) {
						//res.send(response.statusCode, {message:"There are some posthooks available for provider. This sample template application cannot proceed further"});
						logger.info("--- out validateLDAPUser ---");
						callback(null, { statusCode: response.statusCode, messge: "There are some posthooks available for provider. This sample template application cannot proceed further" });
					}
					else if (response.statusCode == 200) {
						// res.send(response.statusCode, JSON.parse(body));
						logger.info("--- out validateLDAPUser ---");
						callback(null, { statusCode: response.statusCode, response: JSON.parse(body) });
					}
					else if (response.statusCode == 400) {
						//res.send(response.statusCode, JSON.parse(body));
						var res = null;
						try {
							logger.info("--- try catch 400---");
							res = JSON.parse(body);
						}
						catch (err) {
							res = body;
						}
						logger.info("---response.statusCode ---" + response.statusCode);
						logger.info("---response.body ---" + body);
						logger.info("---- resonse.res ---" + res.error);
						logger.info("--- out validateLDAPUser ---");
						//callback(null,{statusCode : response.statusCode , response :JSON.parse(body)});
						callback(null, { statusCode: response.statusCode, response: res.error });

					}
					else if (response.statusCode == 401) {
						var res = null;
						try {
							logger.info("--- try catch 401 ---");
							res = JSON.parse(body);
						}
						catch (err) {
							res = body;
						}
						logger.info("---response.statusCode ---" + response.statusCode);
						logger.info("---response.body ---" + body);
						logger.info("---- resonse.res ---" + res.message);
						logger.info("--- out validateLDAPUser ---");
						//callback(null,{statusCode : response.statusCode , response :JSON.parse(body)});
						callback(null, { statusCode: response.statusCode, response: res.message });
					}
					else if (response.statusCode == 404) {
						var res = null;
						try {
							logger.info("--- try catch 404---");
							res = JSON.parse(body);
						}
						catch (err) {
							res = body;
						}
						logger.info("---response.statusCode ---" + response.statusCode);
						logger.info("---response.body ---" + body);
						logger.info("---- resonse.res ---" + res.message);
						logger.info("--- out validateLDAPUser ---");
						//callback(null,{statusCode : response.statusCode , response :JSON.parse(body)});
						callback(null, { statusCode: response.statusCode, response: res.message });
					}
				}
				);

			}

		}
	});
};
