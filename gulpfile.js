'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify');

gulp.task('connect', function() {
  connect.server({
    livereload: true,
    port: 8888
  });
});

gulp.task('html', function () {
  gulp.src('*.html')
    .pipe(livereload());
});

/* CSS
----------------------------------------------- */
gulp.task('sass', function() {
  gulp.src([
    'bower_components/normalize-css/normalize.css',
    'scss/main.scss'
    ])
      .pipe(sass({errLogToConsole: true}))
      .pipe(concat('styles.css'))
      .pipe(gulp.dest('css/'))
      .pipe(livereload());
});

/* JS
----------------------------------------------- */
gulp.task('concat-js', function() {
  gulp.src([
    'bower_components/d3/d3.min.js',
    'bower_components/angular/angular.min.js',
    'src/js/app.js',
    'src/js/components/controllers/appControllers.js',
    'src/js/components/filters/appFilters.js',
    'src/js/components/directives/appDirectives.js',
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(gulp.dest('js'))
    .pipe(livereload());
});

gulp.task('compress', function() {
  return gulp.src('js/scripts.min.js')
    .pipe(uglify({ mangle: false }))
    .pipe(gulp.dest('js'))
    .pipe(livereload());
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(['*.html'], ['html']);
  gulp.watch(['src/js/**/*.js'], ['concat-js']);
  gulp.watch('scss/**/*.scss', ['sass']);
});

gulp.task('default', ['connect', 'compress', 'watch']);