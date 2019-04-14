const fs = require('fs');
const gulp = require('gulp');
const webpack = require('webpack-stream');
const named = require('vinyl-named');
const browserSync = require('browser-sync').create();//静态服务器
const reload = browserSync.reload;
const sass = require('gulp-sass');//编译scss
const minifycss = require('gulp-minify-css');//压缩css
const sassImport = require('gulp-sass-import');
const autofx = require('gulp-autoprefixer');//css浏览器前缀补全
const config = require('./config/config'); 
const runSequence = require('run-sequence');    // 设定同步异步执行任务
const fileinclude  = require('gulp-file-include');
const clean = require('gulp-clean');
const pump = require('pump');
const webpackDev = require('./config/webpack.dev.conf.js');
const webpackPro = require('./config/webpack.pro.conf.js');
let entry;//定义入口
//先遍历文件夹
let dirs =  fs.readdirSync('./config/');
let isEntry = dirs.filter((value,index) =>{
    return value == "entry.js";
})
if(isEntry.length > 0){
    entry = require('./config/entry');// 引入入口
}else{
    let json = {
        entry:"home.html"
    };
    fs.writeFileSync('./config/entry.js',`exports.entry = ${JSON.stringify(json)}`);
    entry = require('./config/entry');
}
//删除dist文件
gulp.task('clean',function(cb){
    pump([
        gulp.src('dist'),
        clean()
    ], cb)
})
//用webpack把js打包
gulp.task('webpack',function(){
    return gulp.src('./src/js/*.js')
        .pipe(named())
        .pipe(webpack(webpackDev))
        .pipe(gulp.dest('./dist/js'))
});
//打包html
gulp.task('html', function() {
    // 适配page中所有文件夹下的所有html，排除page下的include文件夹中html
    gulp.src(['./src/pages/*.html','!./src/pages/include/**.html'])
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
    .pipe(gulp.dest('./dist/pages'));
});
gulp.task('sass', function(){
    return gulp
        .src('./src/scss/*.scss')
        .pipe(sassImport())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autofx(config.autofx))
        .pipe(gulp.dest('./dist/css'))
        .pipe(reload({stream: true}));
})
//打包公共文件
gulp.task('assets',function(){
    return gulp.src('./src/assets/**/*')
        .pipe(gulp.dest('./dist/assets'))
});
//开发环境运行，需要浏览器自动刷新
gulp.task('browser', function () {
    browserSync.init({      // 启动Browsersync服务
        server: {
            baseDir: './dist',   // 启动服务的目录 默认 index.html
            index: '/pages/' + entry.entry.entry // 自定义启动文件名
        },
        open: 'external',   // 决定Browsersync启动时自动打开的网址 external 表示 可外部打开 url, 可以在同一 wifi 下不同终端测试
        injectChanges: true // 注入CSS改变
    });

    // 监听文件变化，执行相应任务
    gulp.watch('./src/**/*.scss',['sass']).on('change', reload);
    gulp.watch('./src/*.scss',['sass']).on('change', reload);
    gulp.watch('./src/pages/**/*.html',['html']).on('change', reload);
    gulp.watch('./src/assets/**/*',['assets']).on('change', reload);
    gulp.watch('./src/js/*.js').on('change', reload);
    gulp.watch('./src/**/*.js').on('change', reload);
})
//开发环境的指令
gulp.task('dev', (cb) => {
    runSequence('clean',[     
        'webpack','html','sass','assets','browser'
    ], cb)
})
//以上是开发环境
//////////////////以下是生产环境
gulp.task('pack-js',function(){
    return gulp.src('./src/js/*.js')
        .pipe(named())
        .pipe(webpack(webpackPro))
        .pipe(gulp.dest('./dist/js'))
});
gulp.task('pack-sass', function(){
    return gulp
        .src('./src/scss/*.scss')
        .pipe(sassImport())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autofx(config.autofx))
        .pipe(minifycss())
        .pipe(gulp.dest('./dist/css'))
        .pipe(reload({stream: true}));
})
//生产环境的指令
gulp.task('build', (cb) => {
    runSequence('clean', [     
        'pack-js',
        'html',
        'pack-sass',
        'assets'
    ],cb)
})