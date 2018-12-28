const path          = require('path');
const slsw          = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry:        slsw.lib.entries,
    resolve:      {
        extensions: [
            '.js',
            '.json',
            '.ts',
        ],
    },
    output:       {
        libraryTarget:     'commonjs2',
        path:              path.join(__dirname, '.webpack'),
        filename:          '[name].js',
        sourceMapFilename: '[file].map',
    },
    target:       'node',
    devtool:      'nosources-source-map',
    mode:         slsw.lib.webpack.isLocal ? 'development' : 'production',
    externals:    [nodeExternals()],
    optimization: {
        // We no not want to minimize our code.
        minimize: false,
    },
    performance:  {
        // Turn off size warnings for entry points
        hints: false,
    },
    module:       {
        rules: [
            {test: /\.ts$/, loader: 'ts-loader', options: {}},
        ],
    },
};
