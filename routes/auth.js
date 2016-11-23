/**
 * http://usejsdoc.org/
 */
var _ = require("lodash");
var user = require("../models/user.js");

var async = require("async");
var mw = require("../middleware/index.js");


var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name: config.APP_NAME,
	level: config.LOG_LEVEL
});

//dependencies : Crypto module with password and encryption type
var crypto = require("crypto");
var cipherPwd = (process.env.SECRET_KEY ? process.env.SECRET_KEY : config.SECRET_KEY);//'secret_key';
var encryptionType = (process.env.ENCRYPTION_TYPE ? process.env.ENCRYPTION_TYPE : config.ENCRYPTION_TYPE);//'aes192';

module.exports = function (app) {
	app.post("/authenticate", function (req, res, next) {
		logger.info("Entering /authenticate post method");
		logger.info("Request ID received is.." + req.body._id);
		logger.info("req.get('host') is " + req.get("host"));

		//only for kaiser 
		if (process.env.organization == "Kaiser") {
			var loginId = req.body._id;
			var loginIdUCase = loginId.toUpperCase();
			req.body._id = loginIdUCase;
		}
		logger.info("Modified Request ID is " + req.body._id);

		//TO BE DELETED(ENCRYPTING REQ)
		//var encryptedData = encryptData(req);
		//logger.info("encryptedData is " + encryptedData);

		//var decryptedData = decryptData(encryptedData);
		//logger.info("decryptedData is " + decryptedData);
		//Going to call authenticate LDAP method.If the method is success(valid user), token is generated for the user.
		//authMS(req, res, next);

		//var obj = JSON.parse(decryptedData);

		//var obj = req;
		authMS(req, res, next);
		logger.info("---- Exiting  /authenticate post method----");

	});

	// End point for Logout 
	// 24Oct2016
	app.post("/logout", function (req, res, next) {
		logger.info("---- Entering  /logout -----");

		var _id = null;
		mw.verifyToken(req, function (err, response) {
			logger.info("response is " + response);
			if (response) {
				var recvdVal = JSON.stringify(response);
				logger.info("recvdVal is " + recvdVal);
				//_id = JSON.parse(recvdVal)[0]._id;
				//_id = JSON.parse(recvdVal).iss[0]._id;
				_id = JSON.parse(recvdVal).iss._id;
				//var group = JSON.parse(recvdVal)[0].group;
				logger.info("--- id:" + _id);

				//set Token validity as FALSE
				var req = { "Tokenvalidity": false, "_id": _id };

				updateTokenValidityForUser(req, function (err, response) {
					if (err) {
						logger.error("---- Error in updating token validity in db:" + err);
						//error = err;
						res.status(500).json({ message: " Problem in logging out " });
						next();
					}
					else {
						logger.info("--- success in updating token validity in db" + response);
						res.status(200).json({ message: "Logged out successfully" });
						next();
					}
				});
			}
			else {
				logger.error("Problem in logging out" + err);
				res.status(500).json({ message: " Problem in logging out " + err });
				next();
			}
		});
	});


	// Verify Token 
	// 24Oct2016
	app.post("/verifyToken", function (req, res, next) {
		logger.info("---- Entering /verifyToken  ---");

		mw.verifyToken(req, function (err, response) {
			logger.info("response is " + response);
			if (err) {
				logger.error("Problem in verifying token" + err);
				res.status(500).json({ message: " Problem in verifying token " });
				logger.info("---- Exiting /verifyToken  ---");
				next();

			}
			else {

				logger.info("--- success in updating token validity in db" + JSON.stringify(response));
				//res.status(200).json({ message: "Logged out successfully" });
				//res = response;
				res.status(200).json({ message: "", resp: JSON.stringify(response) });
				logger.info("---- Exiting /verifyToken  ---");
				next();
			}
		});
	});
};

//decrypt data using crypto
function decryptData(data) {
	logger.info("Inside decryptData..");
	var decipher = crypto.createDecipher(encryptionType, cipherPwd);
	logger.info("decipher is " + decipher);
	try {
		var decrypted = decipher.update(data, config.HEX, config.UTF8);
		logger.info("decrypted1 is " + decrypted);
		decrypted += decipher.final("utf8");
		logger.info("decrypted1 is " + decrypted);
		return decrypted;
	} catch (exception) {
		logger.info("Exception in decrypting...");
		//callback(exception);
	}
}

function authMS(req, res, next) {
	logger.info("---- In authMS ----");
	async.waterfall([
		invokeMS(req),
		invokeAuthorization
	], function (err, success) {
		if (err) {
			logger.error("--- Error" + err);
			res.status(500).json({ message: String(err) });
			logger.info("---- out authMS ---");
			next();
		} else {
			res.status(200).json({ message: success });
			logger.info("---- out authMS ----");
			next();
		}
	});
}

// Method to invoke Authentication Microservice 
var invokeMS = function (req) {
	logger.info("--- in invokeMS ---");
	logger.info("--- req body ---" + req.body);
	//logger.info("--- req login id:" + req.body._id);
	var error = null;
	var response = null;

	var microTestSvc = new require("../authhystrixcmd/microserviceTestSvc.js")();
	microTestSvc = require("../authhystrixcmd/microserviceHystrixCmd.js")(microTestSvc);

	return function (callback) {

		microTestSvc.microserviceHystrixCmd(req, function (err, resp) {
			//removed console.log for resp , to avoid crash - 20Oct2016
			if (err) {
				logger.error("--- err message ---");
				error = err;
				callback(error, null); //Added to handle error scenario - 20Oct2016
			} else {
				logger.info("---- success response ---"); //28Oct2016
				if (resp.statusCode == 401 || resp.statusCode == 404 || resp.statusCode == 400) {
					//logger.info("--- 401,404:"+resp.response.message);
					logger.info("--- 400/401/404:" + resp.response);
					//callback(resp.response.message,null);
					callback(resp.response, null);
				}
				else if (resp.statusCode == 302 || resp.statusCode == 303) {
					logger.info("--- 302,303:" + resp.response.message);
					callback(resp.response.message, null);
				}
				else if (resp.statusCode == 200) {
					var loginId = req.body._id;
					logger.info("--- login id used for db check:" + loginId);

					// find the user from user db,which returns _id and group information by setting _id:true and group:true
					user.find({ _id: req.body._id }, { _id: true, group: true }, function (err, doc) {

						if (err) {
							error = err;
							logger.error("--- error finding user in mongodb ---" + error);
							//main err callback
							callback(error, null);
						}
						else if (doc && doc.length > 0) {
							for (var i = 0; i < doc.length; i++) {
								var obj = doc[i];
								logger.info("element:" + obj);
							}

							logger.info("--- user is ---" + doc[0]._id);
							logger.info("--- group is ---" + doc[0].group);
							if ((doc[0].group == "" || doc[0].group == null)) {
								logger.info("---- group is empty *** so update group ***");
								callback(null, doc);
							} else {
								logger.info("---- user has group ---");
								callback(null, doc);
							}
						}
						else {
							logger.info("---- doc length:" + doc.length);
							/*
							user.findOneAndUpdate(
								{ _id: req.body._id },
								{ "$setOnInsert": { group: "Submitter" } },
								{ upsert: true, new: true },
								function (err, res) {
									//console.log( docs );
									if (err) {
										logger.info("--- error inserting user ---:" + err);
										//err callback
										callback(err, null);
									} else {
										logger.info("--- docs inserted successfully---:" + res);
										response = res;
										logger.info("---user found:" + doc);
										logger.info("--- response:" + response);
										logger.info("--- response id:" + response._id);
										logger.info("---- response group:" + response.group);
										//success callback
										callback(null, response);
									}
								}
							);
							*/
							var bodyJson = {
								"_id": loginId,
								"group": "Submitter"
							};
							var newuser = new user(bodyJson);
							newuser.save(function (err) {
								if (err) {
									logger.info("Error inserting user with default role" + err);
									callback(err, null);
								} else {
									logger.info("User created successfully");
									callback(null, newuser);
								}
							});
						}
					});
				}
			}
		});
	};
};


// Method to generate JSONWebtoken and authorize 
//function invokeAuthorization(req,callback) {
function invokeAuthorization(req, callback) {
	logger.info("--- in invokeAuthorization ---");
	logger.info("input parameter:" + JSON.stringify(req));
	if (req != null) {
		var recvdVal = JSON.stringify(req);

		logger.info("--- email:" + req._id);
		logger.info("---group:" + req.group);
		var _id = JSON.parse(recvdVal)._id;
		logger.info("--- _id:" + _id);
		var error = null;
		var data = null;

		mw.generateToken(req, function (err, resp) {
			if (err) {
				logger.error("error in generating token");
				error = err;
				return (callback(error, null));
			}
			else {
				logger.info("Successfully token generated" + resp);
				data = resp;
				var req = { "Tokenvalidity": true, "_id": _id };
				//Add the token validity in User profile - 21Oct2016
				updateTokenValidityForUser(req, function (err, res) {
					if (err) {
						logger.error("---- Error in token generation:" + err);
						data = null;
						error = err;
						return (callback(error, null));
					}
					else {
						logger.info("---- token:" + data);
						return (callback(error, data));
					}
				});
			}
		});
	} else {
		logger.info("Problem in authorization " + data);
		return (callback("Authorization Problem ", data));
	}
}

//ENCRYPTION
function encryptData(data) {
	logger.info("--- Inside encryptData ---");
	var dataString = JSON.stringify(data.body);
	logger.info("dataString is " + dataString);
	var cipher = crypto.createCipher(encryptionType, cipherPwd);
	logger.info("cipher is " + cipher);
	try {
		var encrypted = cipher.update(dataString, config.UTF8, config.HEX);
		logger.info("encrypted1 is " + encrypted);
		encrypted += cipher.final("hex");
		logger.info("encrypted1 is " + encrypted);
		return encrypted;
	} catch (exception) {
		//callback(exception);
	}
}

// Method to set token validity - True or false. 
// 24Oct2016
function updateTokenValidityForUser(req, callback) {
	logger.info("---- In updateTokenValidityForUser---");
	//logger.info("---- req body---" + req.body);
	logger.info("---- req _id:" + req._id);
	logger.info("---- req tokenvalidity:" + req.Tokenvalidity);

	var _id = req._id;
	var updateJson = {
		"_id": req, _id,
		"tokenValidity": req.Tokenvalidity
	};
	/*
	user.findByIdAndUpdate(_id, { $set: { "tokenValidity": req.Tokenvalidity } }, { new: true }, function (err, success) {
		if (err) {
			logger.error("Err in updating Token validity value:" + err);
			return callback(err, null);
		}
		else {
			logger.info("success in updating Token validity value:" + success);
			return callback(null, success);
		}
	});
	*/
	//REPLICA Error fixes
	user.findById(_id, function (err, user) {
		if (err) {
			logger.info("Error during find user");
		}
		if (user) {
			_.merge(user, updateJson);
			user.save(function (err) {
				if (err) {
					logger.info("Error during user token update" + err);
					return callback(err, null);
				} else {
					logger.info("User token has been updates successfully");
					return callback(null, user);
				}
			});
		} else {
			logger.info("User not found");
			return callback(err, null);
		}
	});

}