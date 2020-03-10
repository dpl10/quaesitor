#!/usr/bin/env node
let n = 0;
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-n'){
		n = parseInt(process.argv[k+1]);
	}
}
if(n > 0){
	function alpha(n, s){
		let a = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'y', 'y', 'z', '.'];
		if(n === 0){
			return(s + '$\n.' + s + '.\n^' + s + '\n');
		} else {
			n -= 1;
			let o = '';
			for(let k = a.length-1; k >= 0; k--){
				o += alpha(n, s + a[k]);
			}
			return(o);
		}
	}
	let p = '';
	for(let k = n; k >= 0; k--){
		p += alpha(k, '');
	}
	process.stdout.write(p, 'UTF8');
} else {
	let o	=	'\nA JavaScript for creating pseudosyllable RegExps.\n'
			+	'usage: pseudosyllables.js -n depth\n\n';
	process.stderr.write(o, 'UTF8');
}
