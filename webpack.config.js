var path = require("path");
var HtmlWebPackPlugin =  require('html-webpack-plugin');

module.exports = {
    entry: "./src/js/main.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/dist"
    },
    devtool: "source-map",
    module: {
        rules: [{
                test: /\.js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["es2015"]
                    }
                }
            },
            {
                test   : /\.css$/,
                loaders: ['style-loader', 'css-loader']
              }, {
                test   : /\.scss$/,
                loaders: ['style-loader', 'css-loader', 'sass-loader?sourceMap']
              },
            {
                test: /\.html$/,
                use: [{
                    loader: "html-loader",
                    options: {
                        minimize: true
                    }
                }]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./src/index.html",
            filename: "./index.html"
        })
    ]
};