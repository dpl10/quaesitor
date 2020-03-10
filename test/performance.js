#!/usr/bin/env node
let a = null;
let d = null;
const fs = require('fs');
let h = false;
let l = '';
let n = null;
const readline = require('readline');
let s = '';
let S = '';
let p = '';
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-a'){
		if(checkFile(process.argv[k+1]) === true){
			a = process.argv[k+1];
		}
	} else if(process.argv[k] === '-d'){
		if(checkDirectory(process.argv[k+1]) === true){
			d = process.argv[k+1];
		}
	} else if(process.argv[k] === '-h'){
		h = true;
	} else if(process.argv[k] === '-l'){
		l = process.argv[k+1].replace(/,/g, '');
	} else if(process.argv[k] === '-n'){
		if(checkFile(process.argv[k+1]) === true){
			n = process.argv[k+1];
		}
	} else if(process.argv[k] === '-p'){
		p = process.argv[k+1].replace(/,/g, '');
	} else if(process.argv[k] === '-s'){
		s = process.argv[k+1].replace(/,/g, '');
		if(s === 'artificial'){
			S = 'A100';
		} else if (s === 'species'){
			S = 'S800';
		} else if (s === 'copious'){
			S = 'COPIOUS';
		}
	}
}
if((notNULL(a) === true) && (notNULL(d) === true) && (notNULL(n) === true) && (notNULL(s) === true)){
	let answers = {};
	let buffer = 'program,dataset,language,file,TP,FP,TN,FN\n';
	let inputAnswers = readline.createInterface({
		input: fs.createReadStream(a),
		output: process.stdout,
		terminal: false
	});
	let numbers = {};
	inputAnswers.on('line', function(line){
		line = line.trim();
		if(line.length > 0){
			const x = line.split('\t');
			if(answers.hasOwnProperty(x[0]) === false){
				answers[x[0]] = {
					harsh: {},
					lenient: {}
				};
			}
			if(answers[x[0]]['lenient'].hasOwnProperty(x[1]) === false){
				answers[x[0]]['lenient'][x[1]] = '';
			}
			if(answers[x[0]]['harsh'].hasOwnProperty(x[2]) === false){
				answers[x[0]]['harsh'][x[2]] = x[1];
			}
		}
		return(false);
	}).on('close', function(){
		let inputNumbers = readline.createInterface({
			input: fs.createReadStream(n),
			output: process.stdout,
			terminal: false
		});
		inputNumbers.on('line', function(line){
			line = line.trim();
			if(line.length > 0){
				const x = line.split('\t');
				if(answers.hasOwnProperty(x[0]) === true){
					numbers[x[0]] = x[1]-Object.keys(answers[x[0]]['harsh']).length-1;
				} else {
					numbers[x[0]] = x[1]-1;
				}
			}
			return(false);
		}).on('close', function(){
			fs.readdirSync(d).forEach(f => {
				if(checkFile(d + '/' + f) === true){
					const r = JSON.parse(fs.readFileSync(d + '/' + f));
					const k = s + f.replace(/\.json$/, '');
					let tp = 0;
					let fp = 0;
					let tn = numbers[k]; /* maybe not the best method, but tn is not used to calculate precision, recall, or F1 (i.e. ignored in all further calculations) */
					let fn = 0;
					if(answers.hasOwnProperty(k) === true){
						for(let x in r){
							if((answers[k]['harsh'].hasOwnProperty(x) === true) || ((h === false) && (answers[k]['lenient'].hasOwnProperty(x) === true)) || ((h === false) && (r[x] != null) && (answers[k]['harsh'].hasOwnProperty(r[x]) === true)) || ((h === false) && (r[x] != null) && (answers[k]['lenient'].hasOwnProperty(r[x]) === true))){
								tp++;
							} else {
								fp++;
								tn--;
							}
						}
						for(let x in answers[k]['harsh']){
							if(h === true){
								if(r.hasOwnProperty(x) === false){
									fn++;
								}
							} else {
								if((r.hasOwnProperty(x) === false) && (r.hasOwnProperty(answers[k]['harsh'][x]) === false)){
									fn++;
								}
							}
						}
					} else {
						fp = Object.keys(r).length;
						tn -= fp;
					}
					buffer += p + ',' + S + ',' + l + ',' + k + ',' + tp + ',' + fp + ',' + tn + ',' + fn + '\n';
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
	});
} else {
	let o	=	'\nA JavaScript for calculating TP,FP,TN,FN from .json data. -h activates harsh\n'
			+	'(strict) scorning.\n'
			+	'usage: performance.js -a answers.tsv -d directory/of/json [ -h ]\n'
			+	'[ -l language ] -n number-of-words.tsv -s dataset [ -p program ]\n\n';
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
