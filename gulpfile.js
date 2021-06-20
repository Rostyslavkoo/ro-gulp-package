let projectFolder = require("path").basename(__dirname);
let sourceFolder = "#src";

let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/assets/css/",
    js: projectFolder + "/assets/js/",
    img: projectFolder + "/assets/img/",
    fonts: projectFolder + "/assets/fonts/",
  },
  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    css: sourceFolder + "/assets/scss/style.scss",
    js: sourceFolder + "/assets/js/main.js",
    img: sourceFolder + "/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp}",
    fonts: sourceFolder + "/assets/fonts/*.ttf",
  },
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/assets/scss/**/*.scss",
    js: sourceFolder + "/assets/js/**/*.js",
    img: sourceFolder + "/assets/img/**/*.{jpg,jpeg,png,svg,gif,webp}"
  },
  clean: "./" + projectFolder + "/"
}

let {
  src,
  dest
} = require('gulp'),
  gulp = require('gulp'),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  group_media = require("gulp-group-css-media-queries"),
  clean_css = require("gulp-clean-css"),
  rename = require("gulp-rename"),
  uglify = require("gulp-uglify-es").default,
  imagemin = require("gulp-imagemin"),
  webp = require("gulp-webp"),
  webpHtml = require("gulp-webp-html"),
  webpCss = require("gulp-webpcss");

function browserSync() {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  })
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(
      webpHtml()
    )
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(
      uglify()
    )
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))

    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(
      group_media()
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 5 versions"],
        cascade: true
      })
    )
    .pipe(
      webpCss()
    )
    .pipe(dest(path.build.css))

    .pipe(
      clean_css()
    )
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function images() {
  return src(path.src.img)
    .pipe(
      webp({
        quality:70

      })
    )
    .pipe(dest(path.build.img))
    src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{
          removeViewBox: false
        }],
        interlaced: true,
        optimizationLevel: 3

      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function watchfiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);

}

function clean() {
  return del(path.clean);
}
let build = gulp.series(clean, gulp.parallel(js, css, html, images));
let watch = gulp.parallel(build, watchfiles, browserSync);

exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
