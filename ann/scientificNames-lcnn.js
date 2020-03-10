#!/usr/bin/env node
const c2i = {
	' ': 0,
	'a': 1,
	'b': 2,
	'c': 3,
	'd': 4,
	'e': 5,
	'f': 6,
	'g': 7,
	'h': 8,
	'i': 9,
	'j': 10,
	'k': 11,
	'l': 12,
	'm': 13,
	'n': 14,
	'o': 15,
	'p': 16,
	'q': 17,
	'r': 18,
	's': 19,
	't': 20,
	'u': 21,
	'v': 22,
	'w': 23,
	'x': 24,
	'y': 25,
	'z': 26
};
const deburr = require('lodash/deburr');
const fs = require('fs');
let i = null;
const readline = require('readline');
let w = 58;
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-i'){
		if(checkFile(process.argv[k+1]) === true){
			i = process.argv[k+1];
		}
	} else if(process.argv[k] === '-w'){
		const x = parseInt(process.argv[k+1]);
		if((isNaN(x) === false) && (x > 0)){
			w = x;
		}
	}
}
if(notNULL(i) === true){
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
			const y = flatten(x[1]).replace(/[^a-z]/g, ' ').split('');
			const z = new Uint8Array(w).fill(0);
			let l = y.length;
			if(l > w){
				l = w;
			}
			for(let k = l-1; k >= 0; k--){
				z[k] = c2i[y[k]];
			}
			buffer += x[0] + ',' + z.join(',') + '\n';
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
} else {
	let o	=	'\nA JavaScript for converting words to lcnn input.\n'
			+	'Input data should have class ID and input word separated by a comma.\n'
			+	'usage: scientificNames-lcnn2.js -i input.csv -w width\n\n';
	process.stderr.write(o, 'UTF8');
}
function checkFile(file){
	try {
		return(fs.statSync(file).isFile());
	} catch(error){
		return(false);
	}
}
function flatten(x){
	return(deburr(x.normalize('NFC').toLowerCase()).replace(/[ɨⅱaắằẵẳặấầẫẩậǎảȃạªbcdḍeếềễểệẽẻẹəfgǵǧhḩḥiǐỉịjkḱlḷmnṅṇoốồỗổộỏọơớờỡởợºpqrṛṟsṡșṣtțṭṯuǔủụưứừữửựvwxyỳỹȳỷzẓ]/g, function(y){
		return({
			'ɨ': 'i',
			'ⅱ': 'i',
			'a': 'a',
			'ắ': 'a',
			'ằ': 'a',
			'ẵ': 'a',
			'ẳ': 'a',
			'ặ': 'a',
			'ấ': 'a',
			'ầ': 'a',
			'ẫ': 'a',
			'ẩ': 'a',
			'ậ': 'a',
			'ǎ': 'a',
			'ả': 'a',
			'ȃ': 'a',
			'ạ': 'a',
			'ª': 'a',
			'b': 'b',
			'c': 'c',
			'd': 'd',
			'ḍ': 'd',
			'e': 'e',
			'ế': 'e',
			'ề': 'e',
			'ễ': 'e',
			'ể': 'e',
			'ệ': 'e',
			'ẽ': 'e',
			'ẻ': 'e',
			'ẹ': 'e',
			'ə': 'e',
			'f': 'f',
			'g': 'g',
			'ǵ': 'g',
			'ǧ': 'g',
			'h': 'h',
			'ḩ': 'h',
			'ḥ': 'h',
			'i': 'i',
			'ǐ': 'i',
			'ỉ': 'i',
			'ị': 'i',
			'j': 'j',
			'k': 'k',
			'ḱ': 'k',
			'l': 'l',
			'ḷ': 'l',
			'm': 'm',
			'n': 'n',
			'ṅ': 'n',
			'ṇ': 'n',
			'o': 'o',
			'ố': 'o',
			'ồ': 'o',
			'ỗ': 'o',
			'ổ': 'o',
			'ộ': 'o',
			'ỏ': 'o',
			'ọ': 'o',
			'ơ': 'o',
			'ớ': 'o',
			'ờ': 'o',
			'ỡ': 'o',
			'ở': 'o',
			'ợ': 'o',
			'º': 'o',
			'p': 'p',
			'q': 'q',
			'r': 'r',
			'ṛ': 'r',
			'ṟ': 'r',
			's': 's',
			'ṡ': 's',
			'ș': 's',
			'ṣ': 's',
			't': 't',
			'ț': 't',
			'ṭ': 't',
			'ṯ': 't',
			'u': 'u',
			'ǔ': 'u',
			'ủ': 'u',
			'ụ': 'u',
			'ư': 'u',
			'ứ': 'u',
			'ừ': 'u',
			'ữ': 'u',
			'ử': 'u',
			'ự': 'u',
			'v': 'v',
			'w': 'w',
			'x': 'x',
			'y': 'y',
			'ỳ': 'y',
			'ỹ': 'y',
			'ȳ': 'y',
			'ỷ': 'y',
			'z': 'z',
			'ẓ': 'z'
		}[y]); })
	);
}
function notNULL(x){
	return(Object.prototype.toString.call(x) === '[object String]');
}
