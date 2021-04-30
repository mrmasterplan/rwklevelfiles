const path = require('path');

module.exports = {
    entry: './tiled/kitty.ts',
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: "tsconfig_kitty.json"
                },
                // use: [{
                // }],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'kitty.js',
        path: path.resolve(__dirname, 'dist'),
    },
    node: {
        __filename: false,
        __dirname: false,
    },
};