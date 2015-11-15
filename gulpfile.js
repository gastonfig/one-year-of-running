var gulp = require('gulp'),
  connect = require('gulp-connect');

gulp.task('connect', function() {
  connect.server({
    livereload: true,
    port: 8888
  });
});

gulp.task('html', function () {
  gulp.src('*.html')
    .pipe(connect.reload());
});

gulp.task('js', function () {
  gulp.src('js/*.js')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['*.html'], ['html']);
  gulp.watch(['js/*.js'], ['js']);
});

gulp.task('default', ['connect', 'watch']);