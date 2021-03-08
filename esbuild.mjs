#!/usr/bin/env node
/* imports from node_modules */
import _ from 'lodash';
import esbuild from 'esbuild';
const nodeConfig = {
	bundle: true,
	entryPoints: [
		'src/index.ts'
	],
	external: [
		'@tensorflow/tfjs',
		'@tensorflow/tfjs-node'
	],
	format: 'esm',
	loader: {
		'.pbf': 'binary'
	},
	minify: false,
	outfile: 'dist/quaesitor-node.js',
	platform: 'node',
	sourcemap: true,
	target: [
		'es2020'
	]
};
esbuild.build(nodeConfig).catch(() => process.exit(1));
let browserConfig = _.cloneDeep(nodeConfig);
browserConfig.minify = true;
browserConfig.outfile = 'dist/quaesitor-browser.js';
browserConfig.platform = 'browser';
esbuild.build(browserConfig).catch(() => process.exit(1));
