const path = require('path')

module.exports = {
    entry: {
        app: path.join(__dirname, 'index.js')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loaders: ['style', 'rtl-css'],
            }
        ]
    },
    resolveLoader: {
        alias: {
            'rtl-css': path.join(__dirname, './../')
        }
    }
}
