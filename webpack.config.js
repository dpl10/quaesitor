const _ = require('lodash');
const copyPlugin = require('copy-webpack-plugin');
const TSLintPlugin = require('tslint-webpack-plugin');
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
				test: /\.ts$/,
				use: {
					loader: 'ts-loader',
					options: {
						allowTsInNodeModules: false,
						configFile: path.resolve('tsconfig.json'),
						errorFormatter: function customErrorFormatter(error, colors) {
							const messageColor = error.severity === 'warning' ? colors.bold.yellow : colors.bold.red;
							return ('Does not work for tslint.... ' + messageColor(Object.keys(error).map(key => `${key}: ${error[key]}`)));
						},
						onlyCompileBundledFiles: true
					}
				}
			}, {
				exclude: path.resolve(__dirname, 'node_modules'),
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
		new copyPlugin({
			patterns: [{
				from: 'assets/*.pbf',
				to: DESTINATION
			}]
		}),
		new TSLintPlugin({
			files: ['src/*.ts']
		})
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
nodeConfig.module.rules[2].options.defines.NODE = true;
nodeConfig.target = 'node';
module.exports = [
	browserConfig,
	nodeConfig
];
