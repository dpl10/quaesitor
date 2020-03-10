#!/usr/bin/env node
let XRegExp = require('xregexp');
let buffer = [];
let d = false;
let deburr = require('lodash/deburr');
let exclusionSet = XRegExp('[^\\p{Latin}\\p{Inherited}\\p{Separator}.]');
function flatten(x){ /* debur++ $(awk '{$1=$1}1' FS="" OFS="\n" | sort -u) */
	return(deburr(x).replace(/[ɨⅱaắằẵẳặấầẫẩậǎảȃạªbcdḍeếềễểệẽẻẹəfgǵǧhḩḥiǐỉịjkḱlḷmnṅṇoốồỗổộỏọơớờỡởợºpqrṛṟsṡșṣtțṭṯuǔủụưứừữửựvwxyỳỹȳỷzẓ]/g, function(y){
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
		}[y])}));
}
function print(x){
	if(x.length > 0){
		let y = x.join('\n') + '\n';
		process.stdout.write(y.replace(/ /g, '\n'), 'UTF8');
	}
}
let readline = require('readline');
let separator = XRegExp('\\p{Separator}+', 'g');
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-d'){
		d = true;
	}
}
let stdin = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false
});
stdin.on('line', function(line){
	let x = line.trim().normalize('NFC').toLowerCase().replace(/\./g, '').replace(separator, ' ').replace(/ +/g, ' ');
	if((x.length > 0) && (exclusionSet.test(x) === false)){
		if(d === true){
			buffer.push(flatten(x));
		} else {
			buffer.push(x);
			let y = flatten(x);
			if(x !== y){
				buffer.push(y);
			}
		}
		if(buffer.length > 10000){
			print(buffer);
			buffer = [];
		}
	}
}).on('close', function(){
	print(buffer);
});
