'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    webserver = require('gulp-webserver'),
    exec = require('gulp-exec'),
    react = require('gulp-react'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs'),
    cleanCSS = require('gulp-clean-css'),
    mocha = require('gulp-mocha');

gulp.task('deployment', ['babel', 'cleancss'], function(cb) {
    pump([
            gulp.src(['public/js/**/*.js', '!public/js/require.js', '!public/js/main.js']),
            sourcemaps.init(),
            uglify(),
            sourcemaps.write(),
            gulp.dest('public/js/')
        ],
        cb
    );
});

gulp.task('cleancss', function() {
    return gulp.src('public/css/**/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('babel', function() {
    return gulp.src(['public/js/**/*.js*', '!public/js/require.js', '!public/js/main.js', '!public/js/plugins/**/*.js', '!public/js/lib/**/*.js', '!public/js/helpers/CircularGridHelper.js'])
        .pipe(babel({
            presets: ['es2015','react']
        }))
        .pipe(gulp.dest('public/js'));
});

gulp.task('sass', function () {
    gulp.src('./public/sass/**/*.scss')
        .pipe(sass({
            indentWidth: 4
        }).on('error', sass.logError))
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('jsx', function () {
    gulp.src('./public/js/**/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('./public/js/jsx/'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./public/sass/**/*.scss', ['sass']);
});

gulp.task('jsx:watch', function () {
    gulp.watch('./public/js/**/*.jsx', ['jsx']);
});

gulp.task('electron', function() {
    gulp.watch('./src/*', ['jsx']);
});

gulp.task('webserver', ['sass:watch'], function() {
    gulp.src('public')
        .pipe(webserver({
            livereload: true,
            open: false,
            port: 8111
        }));
});

gulp.task('dev', ['sass:watch', 'jsx:watch', 'jsx', 'electron', 'webserver']);

gulp.task('unit-test', function() {
    return gulp.
        src('./_test/unit/**/*.js', { read: false }).
        pipe(mocha({
            require: [
                process.cwd() + '/_test/unit/bootstrap.js'
            ]
        })).
        once('error', function() {
            process.exit(1);    // bad happens
        }).
        once('end', function() {
            process.exit(); // good
        });
});

gulp.task('api-test', function() {
    return gulp.
        src('./_test/api/**/*.js').
        pipe(exec('node <%= file.path %>')).
        pipe(exec.reporter());
});
