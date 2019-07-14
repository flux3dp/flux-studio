var gulp = require('gulp'),
    sass = require('gulp-sass'),
    webserver = require('gulp-webserver'),
    exec = require('gulp-exec'),
    react = require('gulp-react'),
    uglify = require('gulp-uglify'),
    pump = require('pump'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    cleanCSS = require('gulp-clean-css'),
    mocha = require('gulp-mocha');

// Polyfill gulp@3.0 API if gulp version >=4
if (gulp.parallel) {
    let gulpV4Task = gulp.task.bind(gulp);
    let gulpV4Watch = gulp.watch.bind(gulp);
    gulp.task = (a, b, c) => {
        if (!c) {
            gulpV4Task(a, b);
        } else {
            gulpV4Task(a, gulp.parallel(b, c));
        }
    };
    gulp.watch = (a, b) => {
        for (var i = 0; i < b.length; i++) {
            gulpV4Watch(a, gulp.series(b[i]));
        }
    };
}

gulp.task('cleancss', function () {
    return gulp.src('public/css/**/*.css')
        .pipe(cleanCSS())
        .pipe(gulp.dest('public/css/'));
});

gulp.task('babel', function () {
    return gulp.src(['public/js/**/*.js*', '!public/js/require.js', '!public/js/main.js', '!public/js/plugins/**/*.js', '!public/js/lib/**/*.js', '!public/js/helpers/CircularGridHelper.js', '!**/*.json'])
        .pipe(babel({
            presets: ['es2015', 'react']
        }))
        .pipe(gulp.dest('public/js'));
});

gulp.task('sass', function () {
    return gulp.src('./public/sass/**/*.scss')
        .pipe(sass({
            indentWidth: 4
        }).on('error', sass.logError))
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('jsx', function () {
    return gulp.src('./public/js/**/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('./public/js/jsx/'));
});

gulp.task('deployment', ['babel', 'cleancss'], function (cb) {
    return pump([
        gulp.src(['public/js/**/*.js', '!public/js/require.js', '!public/js/main.js']),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write(),
        gulp.dest('public/js/')
    ],
    cb
    );
});

gulp.task('sass:watch', function () {
    return gulp.watch('./public/sass/**/*.scss', ['sass']);
});

gulp.task('jsx:watch', function () {
    return gulp.watch('./public/js/**/*.jsx', ['jsx']);
});

gulp.task('electron', function () {
    return gulp.watch('./src/*', ['jsx']);
});

gulp.task('webserver', ['sass:watch'], function () {
    return gulp.src('public')
        .pipe(webserver({
            livereload: true,
            open: false,
            host: '0.0.0.0',
            port: 8111
        }));
});

gulp.task('dev', ['sass:watch', 'jsx:watch', 'jsx', 'sass', 'electron', 'webserver'], () => {
    return new Promise(() => {});
});

gulp.task('unit-test', function () {
    return gulp.
        src('./_test/unit/**/*.js', { read: false }).
        pipe(mocha({
            require: [
                process.cwd() + '/_test/unit/bootstrap.js'
            ]
        })).
        once('error', function () {
            process.exit(1);    // bad happens
        }).
        once('end', function () {
            process.exit(); // good
        });
});

gulp.task('api-test', function () {
    return gulp.
        src('./_test/api/**/*.js').
        pipe(exec('node <%= file.path %>')).
        pipe(exec.reporter());
});