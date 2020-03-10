#!/usr/bin/env node
const readline = require('readline');
let line = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
let o = {};
const t = new RegExp(/\t/);
line.on('line', function(line){
	line = line.trim();
	if(line.length > 0){
		let bits = line.split(t);
		if(bits.length === 5){
			if(o.hasOwnProperty(bits[3]) === false){
				o[bits[3]] = '';
			}
		}
	}
	return(false);
}).on('close', function(){
	process.stdout.write(JSON.stringify(o) + '\n', 'UTF8');
});
