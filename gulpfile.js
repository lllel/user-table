// База
let gulp = require('gulp');
let rename = require('gulp-rename');
let del = require('del');
let run = require('run-sequence');
let pump = require('pump');

// Post-css и его плагины
let postcss = require('gulp-postcss');
let autoprefixer = require('autoprefixer');

// Post-html и его плагины
let posthtml = require('gulp-posthtml');
let include = require('posthtml-include');

// Оптимизация кода
let sass = require('gulp-sass');
let pug = require('gulp-pug');
let plumber = require('gulp-plumber');
let htmlmin = require('gulp-htmlmin');
let minify = require('gulp-csso');
let uglify = require('gulp-uglify');
let babel = require('gulp-babel');
let svgstore = require('gulp-svgstore');
let cheerio = require('gulp-cheerio');
let concat = require('gulp-concat');
let replace = require('gulp-replace');

// Оптимизация изображений
let imagemin = require('gulp-imagemin');
let webp = require('gulp-webp');

// Сервер
let server = require('browser-sync').create();

// Копирует шрифты и картинки в папку билд
gulp.task('copy', function () {
  return gulp.src([
    'source/fonts/**.{woff,woff2}',
    'source/img/**/*'
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
});

// Сборка и минификация стилей для продакшена
gulp.task('style', function () {
  return gulp.src('source/sass/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream());
});

// Минификация html для продакшена
gulp.task('html', function () {
  return gulp.src('source/*.html')
    .pipe(posthtml([
      include()
    ]))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'))
    .pipe(server.stream());
});

// // Сборка html из pug для продакшена
// gulp.task('pug', function () {
//   return gulp.src('source/pug/*.pug')
//     .pipe(plumber())
//     .pipe(pug({
//       pretty: true
//     }))
//     .pipe(gulp.dest('build'));
// });

// Минификация и конкатенация js для продакшена
gulp.task('jsOptimization', function (cd) {
  pump([gulp.src('source/js/*.js'),
    babel(),
    // uglify(),
    // concat('all.js'),
    gulp.dest('build/js')],
  server.reload(), cd);
});

// Создание и оптимизация изображений webp
gulp.task('webp', function () {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'));
});

// Готовим svg-спрайт (без атрибутов)
gulp.task('spriteSvg', function () {
  return gulp.src('source/img/icon-*.svg')
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style').remove();
      },
      parserOptions: {xmlMode: true}
    }))
    .pipe(replace('&gt;', '>'))
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
});

// Копирует полифилы из модулей в корень проекта
gulp.task('polyfills', function () {
  return gulp.src([
    'node_modules/svg4everybody/dist/svg4everybody.js',
    'node_modules/picturefill/dist/picturefill.js',
    'node_modules/babel-polyfill/dist/polyfill.min.js'
  ])
    .pipe(gulp.dest('build/polyfills'));
});

// Очистка папки билд
gulp.task('clean', function () {
  return del('build');
});

// Запус сервера продакшена
gulp.task('serve', function () {
  server.init({
    server: 'build/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch('source/sass/**/*.{scss,sass}', ['style']);
  gulp.watch('source/*.html', ['html']);
  gulp.watch('source/pug/**/*.pug', ['pug']);
  gulp.watch('source/js/**/*.js', ['jsOptimization']);
});

// Создание папки билд
gulp.task('build', function (done) {
  run(
    'clean',
    'style',
    'spriteSvg',
    'webp',
    'html',
    // 'pug',
    'jsOptimization',
    'polyfills',
    'copy',
    done
  );
});

// Эти таски запускать вручную

// Оптимизация и минификация изображений (png, jpg, svg)
gulp.task('images', function () {
  return gulp.src('build/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

// =====================================================================================================================

// npm install gulp-babel babel-cli babel-core babel-preset-es2015 --save-dev
// npm install babel-polyfill --save-dev
// npm install eslint eslint-config-htmlacademy --save-dev
// npm install stylelint stylelint-config-htmlacademy --save-dev
// npm install svg4everybody
// npm install picturefill
