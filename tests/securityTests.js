var should = require("should"),
	sinon = require("sinon");	
var request = require("supertest");

var app = require("../app");
var validID = process.env.VALID_ID;
var pass = process.env.PASS;

var config = require("../config.json");
var logger = require("bunyan").createLogger({
	name:config.APP_NAME,
	level: config.LOG_LEVEL});

describe("Security Tests:", function(){
/* Testing for post users */	
	it("should allow to post a new user", function(done)
        { 			
		request(app)
			 .post("/users")
			   .send({"_id": "admin10@gmail.com",
				"name": "Admin10",
				"group": "Admin"})
			  .expect(200)
			  .expect("Content-Type", /json/)
			  .end(function(err, res) {			  
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
	});	 	
	  it("should not allow to post an existing user", function(done)
        { 			
		request(app)
			 .post("/users")
			   .send({"_id": "admin10@gmail.com",
				"name": "Admin10",
				"group": "Admin"})
			  .expect(400)
			  .expect("Content-Type", /json/)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 		
	}); 
/* Testing for get users */			
 		it("should allow to get all users", function(done)
        { 			
			request(app)
			 .get("/users")
			 .expect("Content-Type", /json/)
			  .expect(200)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
		});
	it("should allow to get users with the mentioned id", function(done)
        { 		
		var	id = "admin10@gmail.com";			
		request(app)
			 .get("/users/"+id)
			 .expect("Content-Type", /json/)
			  .expect(200)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
	});
	it("should display message when tried to get users with the invalid id", function(done)
        { 		
		var	id = "noname@gmail.com";			
		request(app)
			 .get("/users/"+id)
			 .expect("Content-Type", /json/)
			  .expect(400)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
	}); 
/* Testing for update(put) users */			
		 it("should allow to update users with the valid id", function(done)
        { 		
			var	id = "admin10@gmail.com";			
			request(app)
			 .put("/users/"+id)
			 .expect("Content-Type", /json/)
			 .send({"name" : "Admin10Changed"})
			  .expect(200)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
		}); 
		 it("should display error message for update users with the invalid id", function(done)
        { 		
			var	id = "noname@gmail.com";			
			request(app)
			 .put("/users/"+id)
			 .expect("Content-Type", /json/)
			 .send({"name" : "Admin10Changed"})
			  .expect(400)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
		}); 
/* Testing for remove users */			
		 it("should allow to remove users with the valid id", function(done)
        { 		
			var	id = "admin10@gmail.com";			
			request(app)
			 .delete("/users/"+id)
			 .expect("Content-Type", /json/)
			  .expect(200)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
		}); 
	it("should display message for remove users with the invalid id", function(done)
        { 		
		var	id = "noname@gmail.com";			
		request(app)
			 .delete("/users/"+id)
			 .expect("Content-Type", /json/)
			  .expect(400)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
	}); 
/* Testing for authenticate users */			
		 it("should allow to authenticate a valid user", function(done)
        { 			
			request(app)
			 .post("/authenticate")
			   .send({"_id": validID, "password": pass})
			  .expect(200)
			  .expect("Content-Type", /json/)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
					if(res.status == 500){
						done("Not a valid user.");
					}else{
						done();
					}
				}else{
					done();
				}				
			  }); 
		}); 
	it("should not allow to authenticate an invalid user", function(done)
        { 			
		request(app)
			 .post("/authenticate")
			   .send({"_id": "noname@gmail.com"})
			  .expect(500)
			  .expect("Content-Type", /json/)
			  .end(function(err, res) {
				if(res != null){
					logger.info("Result is \n\n\n"+JSON.stringify(res));
				}
				if (err){
					done(err);
				}else{				
					done();
				}
			  }); 	
	});
});
