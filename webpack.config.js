const path = require('path');
const webpack = require('webpack');
const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );
module.exports = {
	context: ROOT,
	devtool: 'cheap-module-source-map',
	devServer: {},
	entry: {
		'main': './index.ts'
	},
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.js$/,
				use: 'source-map-loader'
			}, {
				loader: 'file-loader',
				options: {
					name: '[name].[ext]'
				},
				test: /\.pbf$/
			}, {
				enforce: 'pre',
				exclude: /node_modules/,
				test: /\.ts$/,
				use: 'tslint-loader'
			}, {
				exclude: [ /node_modules/ ],
				test: /\.ts$/,
				use: 'awesome-typescript-loader'
			}
		]
	},
	output: {
		filename: '[name].bundle.js',
		path: DESTINATION
	},
	performance: {
		hints: false
	},
	resolve: {
		extensions: ['.ts', '.js'],
		modules: [
				ROOT,
				'node_modules'
		]
	}
};
