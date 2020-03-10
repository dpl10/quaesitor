#!/usr/bin/env node
let a = null;
let d = null;
const fs = require('fs');
let n = false;
const readline = require('readline');
let s = '';
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-a'){
		if(checkFile(process.argv[k+1]) === true){
			a = process.argv[k+1];
		}
	} else if(process.argv[k] === '-d'){
		if(checkDirectory(process.argv[k+1]) === true){
			d = process.argv[k+1];
		}
	} else if(process.argv[k] === '-n'){
		n = true;
	} else if(process.argv[k] === '-s'){
		s = process.argv[k+1].replace(/,/g, '');
	}
}
if((notNULL(a) === true) && (notNULL(d) === true) && (notNULL(s) === true)){
	let answers = {};
	let buffer = 'file,';
	if(n === true){
		buffer += 'false negative\n';
	} else {
		buffer += 'false positive\n';
	}
	let inputAnswers = readline.createInterface({
		input: fs.createReadStream(a),
		output: process.stdout,
		terminal: false
	});
	inputAnswers.on('line', function(line){
		line = line.trim();
		if(line.length > 0){
			const x = line.split('\t');
			if(answers.hasOwnProperty(x[0]) === false){
				answers[x[0]] = {
					harsh: {},
					lenient: {} /* not used, but kept for compatibility with performance.js */
				};
			}
			if(answers[x[0]]['harsh'].hasOwnProperty(x[2]) === false){
				answers[x[0]]['harsh'][x[2]] = x[1];
			}
		}
		return(false);
	}).on('close', function(){
		fs.readdirSync(d).forEach(f => {
			if(checkFile(d + '/' + f) === true){
				const r = JSON.parse(fs.readFileSync(d + '/' + f));
				const k = s + f.replace(/\.json$/, '');
				if(answers.hasOwnProperty(k) === true){
					if(n === true){
						for(let x in answers[k]['harsh']){
							if(r.hasOwnProperty(x) === false){
								buffer += k + ',' + x + '\n';
							}
						}
					} else {
						for(let x in r){
							if(answers[k]['harsh'].hasOwnProperty(x) === false){
								buffer += k + ',' + x + '\n';
							}
						}
					}
				} else if(n === false){
					for(let x in r){
						buffer += k + ',' + x + '\n';
					}
				}
				if(buffer.length > 10240){
					process.stdout.write(buffer, 'UTF8');
					buffer = '';
				}
			}
			return(false);
		});
		process.stdout.write(buffer, 'UTF8');
		return(false);
	});
} else {
	let o	=	'\nA JavaScript for outputting failures from .json data (harsh standars).\n'
			+	'-n activates false negative output (default is false positive output).\n'
			+	'usage: faultAnalysis.js -a answers.tsv -d directory/of/json [ -n ] -s dataset\n\n';
	process.stderr.write(o, 'UTF8');
}
function checkDirectory(x){
	try {
		return(fs.statSync(x).isDirectory());
	} catch(error){
		return(false);
	}
}
function checkFile(x){
	try {
		return(fs.statSync(x).isFile());
	} catch(error){
		return(false);
	}
}
function notNULL(x){
	return(Object.prototype.toString.call(x) === '[object String]');
}
