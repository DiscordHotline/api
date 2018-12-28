const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

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
    externals: [nodeExternals()],
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
