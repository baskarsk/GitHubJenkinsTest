

# Security API

* Backend REST API for Intake Security.

* Provides the following functionality 

  * Authenticate user with LDAP (Foundry service) true / false.

  * Retrieve user profile information from LDAP

  * Find role user is associated with 

  * Generate a JWT Access Token

  * Session Stored in Redis (in-memory db) 

* Exposes the following REST Endpoints 

### Users endpoint

```
POST   /users
```
```
GET    /users 
```
```
GET    /users/id
```
```
GET    /usersByEmail
```
```
PUT    /users/id
```
```
DELETE /users
```

### Authentication endpoint

```
POST   /authenticate
```

## Running it locally 

* clone repository locally 

```
git clone "repo"
```

* install modules

```
npm install 
```

* Install Development dependencies modules and save for environment 

```
npm install supertest gulp-env --save-dev
```

* running application

```
setting environment variables based on target platform . Example
```
* Kaiser:

```
*   cf set-env security-api serviceUrl https://kaiser-authentication-app.bmxnp.appl.kp.org
*   cf set-env security-api apiKey 3a761850-a220-11e6-b2a3-f33ffabc951a
*   cf set-env security-api platform Bluemix
*   cf set-env security-api organization Kaiser
*   cf set-env security-api authdomain cs.msds.kp.org
*   cf set-env security-api vipAddress cdts-security-api
*   cf set-env security-api eurekaServer cdts-eureka.bmxnp.appl.kp.org
*   cf set-env security-api eurekaPort 80
*   cf set-env security-api statusUrl https://cdts-security-api.bmxnp.appl.kp.org/info
```

* Cognizant:
  
```
*   cf set-env security-api serviceUrl https://BaskarLDAPbd490205-6edd-4f0a-b9bc-f0654a471027.mybluemix.net
*   cf set-env security-api apiKey e62c4360-9076-11e6-be1b-07f94c7038be
*   cf set-env security-api platform Bluemix
*   cf set-env security-api organization Cognizant
*   cf set-env security-api authdomain cognizant.com
*   cf set-env security-api vipAddress security-api
*   cf set-env security-api eurekaServer kaiser-eureka.mybluemix.net
*   cf set-env security-api eurekaPort 80
*   cf set-env security-api statusUrl https://cdts-security-api.mybluemix.net/info
```

* Local:

```
*   export serviceUrl=https://kaiser-authentication-app.bmxnp.appl.kp.org
*   export apiKey=3a761850-a220-11e6-b2a3-f33ffabc951a
*   export platform=Bluemix
*   export organization=Kaiser
*   export authdomain=cs.msds.kp.org
*   export vipAddress=security-api
*   export eurekaServer=kaiser-eureka.mybluemix.net
*   export eurekaPort=80
*   export security-api statusUrl https://cdts-security-api.bmxnp.appl.kp.org/info
```

```
gulp
```

* testing application

```
gulp test 
```
  
##Adding the Compose for MongoDB Service in Bluemix

* Follow instructions in https://new-console.ng.bluemix.net/catalog/services/mongodb-by-compose

* Add the MongoDB Service by Compose in your Bluemix console.

## Deployment

### Steps to Deploy 

* set endpoint and login

```
bluemix api https://api.ng.bluemix.net
```

* login

```
  bluemix login -u "your userid"
```

* set orgs and spaces

```
  cf target -o "your organization"

  cf target -s "your space"
```

* deploying application.

  Modify the manifest.yml with the name you used for MongoDB Service

```
  cf push
```
* Note that if you haven't added the service the bind may not happen and you may need to restage

```
  cf restage
```


###  Verifying logs 

* Bluemix console may not show all logs during application startup. 

* Use the cf logs command from command line to verify logs 

```
  cf logs "project name" 
```
