#!/usr/bin/env node
const fs = require('fs');
let i = null;
let o = null;
const readline = require('readline');
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-i'){
		if(checkFile(process.argv[k+1]) === true){
			i = process.argv[k+1];
		}
	} else if(process.argv[k] === '-o'){
		o = process.argv[k+1];
	}
}
if((notNULL(i) === true) && (notNULL(o) === true)){
	let input = readline.createInterface({
		input: fs.createReadStream(i),
		output: process.stdout,
		terminal: false
	});
	let x = '';
	input.on('line', function(line){
		line = line.trim();
		if(line.length > 0){
			x += line + '\n';
		}
		return(false);
	}).on('close', function(){
		const a = new RegExp(/^([A-Z]) ((?:[a-z ]+){1,})$/);
		const b = new RegExp(/^([A-z.]+) \([A-z]+\) ([a-z]+)$/, 'g');
		const c = new RegExp(/ x /, 'g');
		const d = new RegExp(/-/, 'g');
		const p = new RegExp(/ ssp\. /, 'g');
		const s = new RegExp(/ /);
		const u = new RegExp(/^([A-z.]+ [a-z⨉]+) ([a-z]+)$/);
		const v = new RegExp(/ variety /, 'g');
		const taxonfinder = require('taxonfinder');
		let y = taxonfinder.findNamesAndOffsets(x);
		let z = {};
		for(let k = y.length-1; k >= 0; k--){
			if(y[k].hasOwnProperty('name') === true){
				const n = y[k].name.replace(d, '').replace(a, function(_m, y, z, _o, _s){return(y + '. ' + z);}).replace(b, function(_m, y, z, _o, _s){return(y + ' ' + z);}).replace(p, ' subsp.').replace(v, ' var. ').replace(c, '⨉').replace(u, function(_m, y, z, _o, _s){return(y + ' subsp. ' + z);});
				if((n.split(s).length-1) > 0){
					if(z.hasOwnProperty(n) === true){
						if(z[n].length === 0){
							if(y[k].hasOwnProperty('original') === true){
								z[n] = y[k].original;
							}
						}
					} else {
						if(y[k].hasOwnProperty('original') === true){
							z[n] = y[k].original;
						} else {
							z[n] = '';
						}
					}
				}
			}
		}
		fs.writeFileSync(o, JSON.stringify(z) + '\n', 'UTF8');
		process.stderr.write('...done\n', 'UTF8');
		return(false);
	});
} else {
	let o	=	'\nA JavaScript for running TaxonFinder on a text file.\n'
			+	'This script requies taxonfinder.\n'
			+	'usage: taxonfinder.js -i input.txt -o output.json\n\n';
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