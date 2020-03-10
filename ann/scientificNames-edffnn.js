#!/usr/bin/env node
process.env.TF_CPP_MIN_LOG_LEVEL = '2';
let e = null;
const fs = require('fs');
let i = null;
const readline = require('readline');
const t = process.hrtime();
const tf = require('@tensorflow/tfjs-node');
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-e'){
		if(checkFile(process.argv[k+1]) === true){
			e = process.argv[k+1];
		}
	} else if(process.argv[k] === '-i'){
		if(checkFile(process.argv[k+1]) === true){
			i = process.argv[k+1];
		}
	}
}
if((notNULL(e) === true) && (notNULL(i) === true)){
	tf.loadLayersModel('file://' + e).then(function(edffnn){
		const w = edffnn.getLayer('inputLayer').batchInputShape[1];
		let input = readline.createInterface({
			input: fs.createReadStream(i),
			output: process.stdout,
			terminal: false
		});
		let j = 0;
		let buffer = '';
		input.on('line', function(line){
			line = line.trim();
			if(line.length > 0){
				j++;
				const x = line.split(',');
				const y = new Float32Array(w);
				y[0] = parseFloat(x[2]);
				y[1] = parseFloat(x[3]);
				y[2] = parseFloat(x[4]);
				y[3] = parseFloat(x[5]);
				y[4] = parseFloat(x[6]);
				let o = edffnn.predict(tf.tensor2d(y, [1, w]), {
					batchSize: 1,
					verbose: false
				});
				buffer += line + ',' + Math.fround(o.dataSync()[1]).toFixed(7) + '\n';
				if(buffer.length > 10240){
					process.stdout.write(buffer, 'UTF8');
					buffer = '';
				}
			}
			return(false);
		}).on('close', function(){
			process.stdout.write(buffer, 'UTF8');
			const x = process.hrtime(t);
			process.stderr.write('\n' + j + ' words processed in ' + x[0].toFixed(0) + 's ' + (x[1]/1000000).toFixed(6) + 'ms\n', 'UTF8');
			return(false);
		});
	});
} else {
	let o	=	'\nA JavaScript for running edffnn networks. This script requies tfjs-node.\n'
			+	'Input data should have class ID, word, bf, ecnn, lcnn, pdffnn, and word length separated by commas.\n'
			+	'usage: scientificNames-edffnn.js -e edffnn.json -i input.csv\n\n';
	process.stderr.write(o, 'UTF8');
}
function checkFile(file){
	try {
		return(fs.statSync(file).isFile());
	} catch(error){
		return(false);
	}
}
function notNULL(x){
	return(Object.prototype.toString.call(x) === '[object String]');
}
