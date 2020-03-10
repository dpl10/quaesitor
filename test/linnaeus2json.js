#!/usr/bin/env node
const readline = require('readline');
let line = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
const c = new RegExp(/^#/);
let o = {};
const s = new RegExp(/^[A-Z][a-z]+ [A-za-z]+/);
const t = new RegExp(/\t/);
line.on('line', function(line){
	line = line.trim();
	if(line.length > 0){
		if((line.split(c).length-1) === 0){
			let bits = line.split(t);
			if((bits.length === 5) || (bits.length === 6)){
				if((bits[4].split(s).length-1) > 0){
					if(o.hasOwnProperty(bits[4]) === false){
						o[bits[4]] = '';
					}
				}
			}
		}
	}
	return(false);
}).on('close', function(){
	process.stdout.write(JSON.stringify(o) + '\n', 'UTF8');
});
