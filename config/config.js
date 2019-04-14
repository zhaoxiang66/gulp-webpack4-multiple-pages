// gulp-autoprefixer 添加浏览器前缀
exports.autofx = {
    browsers: [
       'ie >= 9',
       'ie_mob >= 10',
       'ff >= 30',
       'chrome >= 34',
       'safari >= 7',
       'opera >= 23',
       'ios >= 7',
       'android >= 4.4',
       'bb >= 10'
    ],
    cascade: true,
    remove: true
 };