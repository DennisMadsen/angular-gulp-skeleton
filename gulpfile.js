var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var del = require('del');
var path = require('path');
var _ = require('lodash');
var args = require('yargs').argv;
var browserSync = require('browser-sync');

var config = require('./gulp.config')();
var port = process.env.PORT || config.defaultPort;
var environment = process.env.ENVIRONMENT || 'development';

gulp.task('default', ['help']);

gulp.task('help', plugins.taskListing);

gulp.task('clean', function (callback) {
    var files = [].concat(
        config.build,
        config.tmp
    );

    del(files, callback);
});

gulp.task('styles', ['clean-styles'], function () {
    return gulp
        .src(config.less)
        .pipe(plugins.plumber())
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer({
            browsers: ['last 2 versions', '> 5%']
        }))
        .pipe(gulp.dest(config.tmp));
});

gulp.task('fonts', ['clean-fonts'], function () {
    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.buildFonts));
});

gulp.task('images', ['clean-images'], function () {
    return gulp
        .src(config.images)
        .pipe(plugins.imagemin({
            optimizationLevel: 4
        }))
        .pipe(gulp.dest(config.buildImages));
});

gulp.task('l10n', ['clean-l10n'], function () {
    return gulp
        .src(config.l10n)
        .pipe(gulp.dest(config.buildL10n));
});

gulp.task('clean-styles', function (callback) {
    var files = config.tmp + '**/*.css';
    del(files, callback);
});

gulp.task('clean-fonts', function (callback) {
    del(config.buildFonts, callback);
});

gulp.task('clean-images', function (callback) {
    del(config.buildImages, callback);
});

gulp.task('clean-l10n', function (callback) {
    del(config.buildL10n, callback);
});

gulp.task('clean-code', function (callback) {
    var files = [].concat(
        config.tmp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    del(files, callback);
});

gulp.task('vet', ['bower-restore'], function () {
    return gulp
        .src(config.alljs)
        //.pipe(plugins.jscs())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('jshint-stylish', {
            verbose: true
        }));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function () {
    var sources = [].concat(config.js, config.css);

    return gulp
        .src(config.index)
        .pipe(plugins.inject(gulp.src(sources, {
            read: false
        })))
        .pipe(gulp.dest(config.src));
});

gulp.task('wiredep', ['bower-restore'], function () {
    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(plugins.plumber())
        .pipe(wiredep(options))
        .pipe(plugins.inject(gulp.src(config.html5shiv, {
            read: false
        }), {
            starttag: '<!-- inject:html5shiv:js -->'
        }))
        .pipe(gulp.dest(config.src));
});

gulp.task('templatecache', ['clean-code'], function () {
    return gulp
        .src(config.htmltemplates)
        .pipe(plugins.minifyHtml({
            empty: true
        }))
        .pipe(plugins.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.tmp));
});

gulp.task('build', ['optimize', 'fonts', 'images', 'l10n'], function () {
    var msg = {
        title: 'Gulp build',
        subtitle: 'Deployed to the build folder',
        message: 'Run `gulp serve-build`'
    };
    notify(msg);
});

gulp.task('optimize', ['inject', 'templatecache'], function () {

    var assets = plugins.useref.assets({
        searchPath: './'
    });
    var templateCache = config.tmp + config.templateCache.file;
    var cssFilter = plugins.filter('**/*.css');
    var jsLibFilter = plugins.filter('**/lib.js');
    var jsAppFilter = plugins.filter('**/app.js');

    return gulp
        .src(config.index)
        .pipe(plugins.plumber())
        .pipe(plugins.inject(gulp.src(templateCache, {
            read: false
        }), {
            starttag: '<!-- inject:templates:js -->'
        }))
        .pipe(assets)
        .pipe(cssFilter)
        .pipe(plugins.csso())
        .pipe(cssFilter.restore())
        .pipe(jsLibFilter)
        .pipe(plugins.uglify())
        .pipe(jsLibFilter.restore())
        .pipe(jsAppFilter)
        .pipe(plugins.ngAnnotate())
        .pipe(plugins.uglify())
        .pipe(jsAppFilter.restore())
        .pipe(plugins.rev())
        .pipe(assets.restore())
        .pipe(plugins.useref())
        .pipe(plugins.revReplace())
        .pipe(gulp.dest(config.build))
        .pipe(plugins.rev.manifest())
        .pipe(gulp.dest(config.build));
});

gulp.task('bump', function () {
    var type = args.type;
    var version = args.version;
    var options = {};

    if (version) {
        options.version = version;
    } else {
        options.type = type;
    }

    return gulp
        .src(config.packages)
        .pipe(plugins.bump(options))
        .pipe(gulp.dest(config.root));
});

gulp.task('less-watcher', function () {
    gulp.watch([config.less], ['styles']);
});

gulp.task('serve-build', ['build'], function () {
    serve(false);
});

gulp.task('serve-dev', ['inject'], function () {
    serve(true);
});

gulp.task('bower-restore', function () {
    return plugins.bower();
});


/////////

function serve(isDev) {
    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    return plugins.nodemon(nodeOptions)
        .on('restart', ['vet'], function (ev) {
            setTimeout(function () {
                browserSync.notify('reloading now...');
                browserSync.reload({
                    stream: false
                });
            }, config.browserReloadDelay);
        })
        .on('start', function () {
            startBrowserSync(isDev);
        });
}

function startBrowserSync(isDev) {
    if (args.nosync || browserSync.active) {
        return;
    }

    if (isDev) {
        gulp.watch([config.less], ['styles']);
    } else {
        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload]);
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [config.src + '**/*.*'] : [],
        ghostMode: {
            clicks: true,
            locations: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'info',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0
    };

    browserSync(options);
}

function notify(options) {
    var notifier = require('node-notifier');
    var notifyOptions = {
        sound: 'Bottle',
        contentImage: path.join(__dirname, './gulp.png'),
        icon: path.join(__dirname, './gulp.png')
    };
    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}