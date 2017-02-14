module.exports = (config) => {
    config.set({
        frameworks: ["jasmine"],
        files: [
            "test/index.js",
        ],
        preprocessors: {
            "test/index.js": ["webpack"],
        },
        webpack: {
            module: {
                exprContextCritical: false,
                loaders: [
                    {
                        test: /\.js/,
                        exclude: /node_modules/,
                        loader: "babel-loader",
                        query: {
                            presets: ['es2015']
                        }
                    }
                ]
            },
            watch: true
        },
        webpackServer: {
            noInfo: true
        },
        browsers: ['PhantomJS'],

        reporters: ["progress"],
        port: 9876,
        colors: true,
        autoWatch: false,
        singleRun: true,
        // config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        concurrency: Infinity,
        plugins: [
            "karma-webpack",
            "karma-jasmine",
            "karma-phantomjs-launcher"
        ],
    })
};
