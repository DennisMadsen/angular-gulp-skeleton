module.exports = function () {

    var src = './src/';
    var build = './build/';
    var app = src + 'app/';
    var root = './';
    var content = src + 'content/';
    var contentCss = content + 'css/';
    var contentFonts = content + 'fonts/';
    var contentImages = content + 'images/';
    var server = './server/';
    var tmp = './.tmp/';

    var config = {
        src: src,
        css: [
            tmp + '**/*.css'
        ],
        html: src + '**/*.html',
        htmltemplates: app + '**/*.html',
        fonts: [
            './bower_components/fontawesome/fonts/**/*.*',
            contentFonts + '**/*.*'
        ],
        images: [
            contentImages + '**/*.*'
        ],
        l10n: src + './l10n/*.json',
        index: src + 'index.html',
        js: [
            app + '**/*.js'
        ],
        alljs: [
            './src/**/*.js',
            './*.js'
        ],
        less: [
            contentCss + 'default.less'
        ],
        server: server,
        tmp: tmp,
        root: root,
        build: build,
        buildFonts: build + 'fonts/',
        buildImages: build + 'images/',
        buildL10n: build + 'l10n/',

        /**
         * Template cache
         */
        templateCache: {
            file: 'templates.js',
            options: {
                module: 'app',
                standAlone: false,
                root: 'app/'
            }
        },

        /**
         * Browser sync
         */
        browserReloadDelay: 1000,

        /**
         * Bower and NPM locations
         */
        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '..'
        },
        packages: [
            './package.json',
            './bower.json'
        ],

        /**
         * html5shiv
         */
        html5shiv: './bower_components/html5shiv/dist/html5shiv.min.js',

        /**
         * Node
         */
        defaultPort: 7203,
        nodeServer: server + 'app.js'
    };

    config.getWiredepDefaultOptions = function () {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath,
            exclude: ['bower_components/html5shiv/dist/html5shiv.js']
        };

        return options;
    };

    return config;
};