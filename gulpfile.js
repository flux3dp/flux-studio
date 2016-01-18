'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    webserver = require('gulp-webserver'),
    mocha = require('gulp-mocha');

gulp.task('sass', function () {
    gulp.src('./public/sass/**/*.scss')
        .pipe(sass({
            indentWidth: 4
        }).on('error', sass.logError))
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./public/sass/**/*.scss', ['sass']);
});

gulp.task('webserver', function() {
    gulp.src('public')
        .pipe(webserver({
            livereload: true,
            open: true,
            port: 8080
        }));
});

gulp.task('dev', ['sass:watch', 'webserver']);

gulp.task('test', function() {
    return gulp.
        src('./_test/**/*.js', { read: false }).
        pipe(mocha({
            require: [
                process.cwd() + '/_test/bootstrap.js'
            ]
        })).
        once('error', function() {
            process.exit(1);    // bad happens
        }).
        once('end', function() {
            process.exit(); // good
        });
});