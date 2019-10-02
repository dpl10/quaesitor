const _ = require('lodash');
const copyPlugin = require('copy-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const webpack = require('webpack');
const ROOT = path.resolve( __dirname, 'src' );
const DESTINATION = path.resolve( __dirname, 'dist' );
const commonConfig = {
	context: ROOT,
	devtool: 'cheap-module-source-map',
	devServer: {},
	entry: {
		'main': './index.ts'
	},
	externals: [],
	module: {
		rules: [
			{
				enforce: 'pre',
				test: /\.js$/,
				use: 'source-map-loader'
			}, {
				enforce: 'pre',
				exclude: /node_modules/,
				test: /\.ts$/,
				use: 'tslint-loader'
			}, {
				exclude: /node_modules/,
				test: /\.ts$/,
				use: 'awesome-typescript-loader'
			}, {
				exclude: /node_modules/,
				loader: require.resolve('webpack-preprocessor-loader'),
            options: {
					defines: {
						WEB: true
					}
				},
				test: /\.ts$/
			}
		]
	},
	output: {
		globalObject: 'this',
		library: 'quaesitor',
		libraryTarget: 'umd',
		path: DESTINATION
	},
	performance: {
		hints: false
	},
	plugins: [
		new copyPlugin([{
			from: 'assets/*.pbf',
			to: DESTINATION
		}]),
	],
	resolve: {
		extensions: ['.ts', '.js'],
		modules: [
				ROOT,
				'node_modules'
		]
	}
};
const browserConfig = _.cloneDeep(commonConfig);
browserConfig.target = 'web';
browserConfig.output.filename = 'quaesitor-broswer.js';
const nodeConfig = _.cloneDeep(commonConfig);
nodeConfig.externals.push(nodeExternals());
nodeConfig.output.filename = 'quaesitor-node.js';
nodeConfig.module.rules[3].options.defines.NODE = true;
nodeConfig.target = 'node';
module.exports = [
	browserConfig,
	nodeConfig
];
