const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const htmlmin = require("gulp-htmlmin");
const rename = require("gulp-rename");
const squoosh = require("gulp-libsquoosh");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const terser = require("gulp-terser");

// HTML

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({  collapseWhitespace: true }))
    .pipe(gulp.dest('build'));
}

exports.html = html;

// Styles

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Scripts

const script = () => {
  return gulp.src("source/js/script.js")
  // .pipe(terser())
  .pipe(rename("script.min.js"))
  .pipe(gulp.dest("build/js"))
}

exports.script = script;

// Swiper

const SScript = () => {
  return gulp.src("node_modules/swiper/swiper-bundle.js")
    .pipe(terser())
    .pipe(rename("swiper.min.js"))
    .pipe(gulp.dest("build/js"))
}

exports.SScript = SScript;

const scriptModal = () => {
  return gulp.src("source/js/modal.js")
  .pipe(terser())
  .pipe(rename("modal.min.js"))
  .pipe(gulp.dest("build/js"))
}

exports.scriptModal = scriptModal;

// Images

const optimizeImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(squoosh())
  .pipe(gulp.dest("build/img"))
}

exports.optimizeImages = optimizeImages;

const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
  .pipe(gulp.dest("build/img"))
}

exports.copyImages = copyImages;

// Webp

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"))
}

exports.createWebp = createWebp;

// Sprite {

const sprite = () => {
  return gulp.src("source/img/icons/*.svg")
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Copy

const copy = (done) => {
  gulp.src([
    // "source/fonts/*.{woff2, woff}",
    "source/*.ico",
    "source/img/**/*.svg",
    "!source/img/icons/*.svg",
    // "source/manifest.webmanifest"
  ],{
    base: "source"
  })
    .pipe(gulp.dest("build"))
  done();
}

exports.copy = copy;

// Clean

const clean = () => {
  return del(["build"])
}

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Reload

const reload = (done) => {
  sync.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/js/**/*.js", gulp.series("script"));
  gulp.watch("source/*.html", gulp.series(html, reload));
}

// Build

const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    script,
    scriptModal,
    sprite,
    createWebp
  )
)

exports.build = build;

// Default

exports.default = gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    html,
    styles,
    script,
    SScript,
    // scriptModal,
    sprite,
    // createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
