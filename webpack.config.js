const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
    context: __dirname,
    entry:   slsw.lib.entries,
    devtool: 'source-map',
    mode:    'production',
    resolve: {
        extensions: [
            '.js',
            '.jsx',
            '.json',
            '.ts',
            '.tsx',
        ],
    },
    output:  {
        libraryTarget:     'commonjs',
        path:              path.join(__dirname, '.webpack'),
        filename:          '[name].js',
        sourceMapFilename: '[name].map',
    },
    target:  'node',
    module:  {
        rules: [
            {
                test:    /\.ts(x?)$/,
                loader:  'ts-loader',
                options: {},
            },
        ],
    },
};
