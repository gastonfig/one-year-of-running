var gulp = require('gulp'),
  connect = require('gulp-connect'),
  concat = require('gulp-concat'),
  livereload = require('gulp-livereload'),
  sass = require('gulp-sass');

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
gulp.task('js', function () {
  gulp.src('js/*.js')
    .pipe(livereload());
});

gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(['*.html'], ['html']);
  gulp.watch(['js/*.js'], ['js']);
  gulp.watch('scss/**/*.scss', ['sass']);
});

gulp.task('default', ['connect', 'watch'], function() {

});