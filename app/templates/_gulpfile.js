var gulp = require('gulp');
var plugins = require("gulp-load-plugins")({lazy:false});
var gulpBowerFiles = require('gulp-bower-files');
var gutil = require('gulp-util');
var gulpFilter = require('gulp-filter');

function createFileFromString(filename, string) {
  var src = require('stream').Readable({ objectMode: true })
  src._read = function () {
    this.push(new gutil.File({ cwd: "", base: "", path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src
}

// gulp.task('coffee', function() {
//   gulp.src('./app/**/*.coffee')
//     .pipe(coffee({bare: true}).on('error', gutil.log))
//     .pipe(gulp.dest('./app/scripts'))
// });

gulp.task('scripts', function(){
    //combine all js files of the app
// var jshintOptions = {
//       strict:false,
//       undef:false,
//       globalstrict:false
//     }
    gulp.src(['!./app/**/*_test.js','./app/**/*.js'])
        // .pipe(plugins.jshint(jshintOptions))
        // .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.concat('main.js'))
        .pipe(gulp.dest('./build/scripts'));
});
gulp.task('cleanBuild', function (cb) {
    return gulp.src('build', {read: false})
        .pipe(plugins.clean());
        cb()
});
gulp.task('templates',function(){
    //combine all template files of the app into a js file
    gulp.src(['!./app/index.html',
        './app/**/*.html'])
        .pipe(plugins.angularTemplatecache('templates.js',{standalone:true}))
        .pipe(gulp.dest('./build/scripts'));
});

gulp.task('css', function(){
    gulp.src('./app/**/*.css')
        .pipe(plugins.concat('main.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('vendorJS', function(){
    //concatenate vendor JS files
    // gulp.src(['!./bower_components/**/*.min.js',
    //     './bower_components/**/*.js'])
      gulpBowerFiles()
      /*
       * If you need the scripts to be loaded in a different order,
       * edit the array below
       */
        .pipe(plugins.order([
          "**/jquery.js",
          "**/angular.js",
          "**/angular-*.js",
          '**/lo-dash.compat.js',
          '**/safeApply.js',
          '**/restangular.js',
          '**/ngForce.js',
          '**/ngForce-*.js'
        ]))

        .pipe(plugins.concat('lib.js'))
        .pipe(gulp.dest('./build/scripts'));
});

gulp.task('vendorFonts', function(){
    //concatenate vendor CSS files
    gulpBowerFiles()
    .pipe(gulpFilter('**/fonts/*'))
    .pipe(plugins.flatten())
    .pipe(gulp.dest('./build/fonts'));
});

gulp.task('vendorCSS', function(){
    //concatenate vendor CSS files
    gulpBowerFiles()
    .pipe(gulpFilter('**/*.css'))
        .pipe(plugins.concat('lib.css'))
        .pipe(gulp.dest('./build/styles'));
});

gulp.task('copy-index', function() {
    gulp.src('./app/index.html')
        .pipe(gulp.dest('./build'));
});

gulp.task('watch',function(){
    gulp.watch([
        'build/**/*.html',
        'build/**/*.js',
        'build/**/*.css'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });
    // gulp.watch(['./app/**/*.coffee'],['coffee','scripts']);
    gulp.watch(['./app/**/*.js','!./app/**/*test.js'],['scripts']);
    gulp.watch(['!./app/index.html','./app/**/*.html'],['templates']);
    gulp.watch('./app/**/*.css',['css']);
    gulp.watch('./app/index.html',['copy-index']);

});

gulp.task('connect', plugins.connect.server({
    root: ['build'],
    port: 9000,
    livereload: true
}));

gulp.task('zip-staticresource', function () {
    return gulp.src('build/**')
        .pipe(plugins.zip('<%= appName %>.resource'))
        .pipe(gulp.dest('../src/staticresources'));
});

gulp.task('meta-staticresource', function () {
    return createFileFromString('<%= appName %>.resource-meta.xml', '<?xml version="1.0" encoding="UTF-8"?><StaticResource xmlns="http://soap.sforce.com/2006/04/metadata"><cacheControl>Private</cacheControl><contentType>application/x-zip-compressed</contentType></StaticResource>')
        .pipe(gulp.dest('../src/staticresources'));
});

gulp.task('save', ['zip-staticresource','meta-staticresource'])
gulp.task('build', ['connect',/*'coffee',*/'scripts','templates','css','copy-index','vendorJS','vendorCSS','watch']);
gulp.task('cleanAndBuild', ['cleanBuild'], function() {
  gulp.start('build');
});
gulp.task('default',['cleanAndBuild']);
