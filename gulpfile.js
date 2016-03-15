'use strict';

var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    livereload = require('gulp-livereload'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    ghPages = require('gulp-gh-pages'),
    cleanCSS = require('gulp-clean-css'),
    DIST_DIR = 'dist/',
    SRC_DIR = 'src/';

gulp.task('connect', function() {
  connect.server({
    root: DIST_DIR,
    livereload: true,
    port: 8888
  });
});

/* DEPLOY TO GITHUB PAGES
----------------------------------------------- */
gulp.task('deploy', ['compress', 'minify-css'], function() {
  return gulp.src(DIST_DIR + '**/*')
    .pipe(ghPages());
});

/* HTML
----------------------------------------------- */
gulp.task('html', function () {
  gulp.src(DIST_DIR + '*.html')
    .pipe(livereload());
});

/* CSS
----------------------------------------------- */
gulp.task('sass', function() {
  gulp.src([
    'bower_components/normalize-css/normalize.css',
    SRC_DIR + 'scss/main.scss'
    ])
      .pipe(sass({errLogToConsole: true}))
      .pipe(concat('styles.css'))
      .pipe(gulp.dest(DIST_DIR + 'css/'))
      .pipe(livereload());
});

gulp.task('minify-css', function() {
  return gulp.src(DIST_DIR + 'css/styles.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(DIST_DIR + 'css/'));
});

/* JS
----------------------------------------------- */
gulp.task('concat-js', function() {
  gulp.src([
    'bower_components/d3/d3.min.js',
    'bower_components/angular/angular.min.js',
    SRC_DIR + 'js/app.js',
    SRC_DIR + 'js/components/controllers/appControllers.js',
    SRC_DIR + 'js/components/filters/appFilters.js',
    SRC_DIR + 'js/components/directives/appDirectives.js',
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest(DIST_DIR + 'js'))
    .pipe(livereload());
});

gulp.task('compress', function() {
  return gulp.src(DIST_DIR + 'js/scripts.min.js')
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest(DIST_DIR + 'js'))
    .pipe(livereload());
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch([DIST_DIR + '*.html'], ['html']);
  gulp.watch([SRC_DIR + 'js/**/*.js'], ['concat-js']);
  gulp.watch(SRC_DIR + 'scss/**/*.scss', ['sass']);
});

gulp.task('default', ['connect', 'watch']);