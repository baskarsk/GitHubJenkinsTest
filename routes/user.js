var _ = require('lodash');
var user = require('../models/user.js');
var config = require('../config.json');
var logger = require('bunyan').createLogger({
			name:config.APP_NAME,
			level: config.LOG_LEVEL});

module.exports = function(app) {

    /* Create */
    app.post('/users', function (req, res) {
    	logger.info('Entering user post method');
        user.find({_id : req.body._id}, function (err, docs) {
            if (!docs.length){
            	var newuser = new user(req.body);
                newuser.save(function(err) {
                    if (err) {
                        res.json({info: 'error during user create', error: err});
						logger.warn('Error during user create');
                    } else {
						res.json({info: 'user created successfully'});
						logger.info('Exiting user post method');
                    }
                });
            }else{
				res.status(400);
				res.json({info: 'user already created'});
				logger.warn('User already created');	    
            }
        });
    });

    /* Read */
    app.get('/users', function (req, res) {
	logger.info('Entering user get method');
        user.find(function(err, users) {
            if (err) {
                res.json({info: 'error during find users', error: err});
				logger.warn('Error during find users');
            }
            else{
            	if(users.length > 0){
                    res.status(200);
            		res.json(users);
            	}
            	else{
            		res.json({info: 'No users', data: 0});
            	}
            }
			logger.info('Exiting user get method');	
        });
    });

    app.get('/users/:id', function (req, res) {

        logger.info('Entering user getById method');
        var loginId = req.params.id;
        var organization = process.env.organization;
        if (organization == 'Kaiser'){
            loginId = req.params.id.toUpperCase();
        }    
        logger.info("--- loginId ---" + loginId);
        logger.info("---- organization:"+organization);

        user.findById(loginId, function(err, user) {
            if (err) {
                res.json({info: 'error during find user', error: err});
				logger.warn('Error during find user');
            };
            if (user) {
                res.json({info: 'user found successfully', data: user});
                //res.status(200);
                //res.json(user);
				logger.info('Exiting user getById method');
            } else {
				res.status(400);
                res.json({info: 'user not found'});
				logger.info('User not found');
            }
        });
    });

    /* Update */
    app.put('/users/:id', function (req, res) {
	logger.info('Entering user put method');
        user.findById(req.params.id, function(err, user) {
            if (err) {
                res.json({info: 'error during find user', error: err});
				logger.warn('Error during find user');
            };
            if (user) {
                _.merge(user, req.body);
                user.save(function(err) {
                    if (err) {
                        res.json({info: 'error during user update', error: err});
						logger.warn('Error during user update');
                    };
                    res.json({info: 'user updated successfully'});
					logger.info('Exiting user put method');
                });
            } else {
				res.status(400);
                res.json({info: 'user not found'});
				logger.warn('User not found');
            }

        });
    });

    /* Delete */
    app.delete('/users/:id', function (req, res) {
		logger.info('Entering user delete method');
        user.findByIdAndRemove(req.params.id, function(err, user) {
            if (err) {
                res.json({info: 'error during remove user', error: err});
				logger.warn('Error during remove user');
            };
	    if(user){	
			res.json({info: 'user removed successfully'});
			logger.info('Exiting user delete method');
	    }else{
			res.status(400);
            res.json({info: 'user not found'});
			logger.warn('User not found');
	    }
        });
    });  

};
