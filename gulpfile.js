'use strict';

var gulp = require('gulp'),
    sass = require('gulp-sass');

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