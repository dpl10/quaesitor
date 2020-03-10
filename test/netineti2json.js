#!/usr/bin/env node
const readline = require('readline');
let line = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
let o = {};
const b = new RegExp(/\[|\]/);
const p = new RegExp(/spp$/);
const s = new RegExp(/ /);
const u = new RegExp(/^([A-z.]+ [a-z⨉]+) ([a-z]+)$/);
line.on('line', function(line){
	line = line.trim();
	if(line.length > 0){
		if((line.split(s).length-1) > 0){
			if(o.hasOwnProperty(line) === false){
				let bline = line.split(b);
				if((bline.length-1) === 0){
					o[line] = '';
				} else {
					o[bline.join('')] = bline[0] + '.' + bline[2].replace(p, 'spp.').replace(u, function(_m, y, z, _o, _s){return(y + ' subsp. ' + z);});
				}
			}
		}
	}
	return(false);
}).on('close', function(){
	process.stdout.write(JSON.stringify(o) + '\n', 'UTF8');
});
