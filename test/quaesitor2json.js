#!/usr/bin/env node
const readline = require('readline');
let line = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
let o = {};
line.on('line', function(line){
	line = line.trim();
	if(line.length > 0){
		if(o.hasOwnProperty(line) === false){
			o[line] = '';
		}
	}
	return(false);
}).on('close', function(){
	process.stdout.write(JSON.stringify(o) + '\n', 'UTF8');
});
