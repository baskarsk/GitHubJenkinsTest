var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var gulpmocha = require('gulp-mocha');

// TO CHECK...
 var env = require('gulp-env');
//var supertest = require('supertest'); 

gulp.task('default',function(){
    nodemon({
        script: 'app.js',
        ext: 'js',
        env: {
            PORT: 8000
        },
        ignore: ['./node_modules']
    })
    .on('restart',function(){
        console.log('Restarting');
    });
}); 

gulp.task('test',function(){
	 //var mongoose = require('mongoose');
	//mongoose.Promise = global.Promise;
	//mongoose.connect('mongodb://localhost/project'); 
    env({vars: {ENV:'Test',
		VALID_ID:'santhosh@cognizant.com',
		PASS:'password-1'}});
    /* gulp.src('tests/*.js', {read: false})
        .pipe(gulpmocha({'reporter':'nyan'})) */
	gulp.src('tests/securityTests.js', {read: false})
        .pipe(gulpmocha({'reporter':'nyan'}))	

}); 
