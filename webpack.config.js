const path          = require('path');
const slsw          = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry:     slsw.lib.entries,
    resolve:   {
        extensions: [
            '.js',
            '.json',
            '.ts',
        ],
    },
    output:    {
        libraryTarget: 'commonjs',
        path:          path.join(__dirname, '.webpack'),
        filename:      '[name].js',
    },
    target:    'node',
    devtool:   'source-map',
    mode:      slsw.lib.webpack.isLocal ? 'development' : 'production',
    externals: [nodeExternals()],
    module:    {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader', options: {}},
        ],
    },
};
