'use-strict';

const gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    useref = require('gulp-useref');

gulp.task('webserver', ['build'], () => {
  gulp.src('tmp')
  .pipe(webserver({
    livereload: true,
    directoryListing: false,
    open: true,
    port: 8088,
    fallback: 'index.html'
  }));
});

gulp.task('assets', () => {
  return gulp.src('src/assets/*.png')
        .pipe(gulp.dest('tmp/assets/'));
});

gulp.task('build', ['assets'], () => {
  return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(gulp.dest('tmp'));
});

gulp.task('webserver:watch', ['webserver'], () => {
  gulp.watch('src/**/*', ['build']);
});

gulp.task('default', ['webserver:watch']);
