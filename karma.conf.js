const webpack = require('webpack');

module.exports = (config) => {
    config.set({
        frameworks: ["mocha", "sinon-chai"],
        files: [
            "node_modules/babel-polyfill/dist/polyfill.js",
            "test/index.js",
        ],
        preprocessors: {
            "test/index.js": ["webpack"],
        },
        webpack: {
            module: {
                exprContextCritical: false,  // TODO
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
        browsers: ["Chromium", /*"Chrome"*/],
        reporters: ["progress", "verbose"],
        client: {
            captureConsole: true,
            mocha: {
                bail: true
            }
        },
        port: 9876,
        colors: true,
        autoWatch: true,
        singleRun: false,
        // config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        concurrency: Infinity,
        plugins: [
            "karma-webpack",
            "karma-mocha",
            "karma-sinon-chai",
            "karma-chrome-launcher",
            "karma-verbose-reporter",
        ],
    })
};
