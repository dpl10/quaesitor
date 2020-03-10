#!/usr/bin/env node
let Pbf = require('pbf');
let filter = { /* manually constructed from the output of 'node_modules/pbf/bin/pbf ../monographia/src/app/bloom-filter.proto' */
	write: function(obj, pbf){
		if(obj.f){
			pbf.writePackedFixed32(1, obj.f);
		}
		if(obj.k){
			pbf.writeVarintField(2, obj.k);
		}
		if(obj.m){
			pbf.writeVarintField(3, obj.m);
		}
	}
};
let fs = require('fs');
let i = null;
let p = 0.001;
let readline = require('readline');
let s = null;
let xxhash = require('xxhash-wasm');
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-i'){
		function checkFile(file){
			try {
				return(fs.statSync(file).isFile());
			} catch(error){
				return(false);
			}
		}
		if(checkFile(process.argv[k+1]) === true){
			i = process.argv[k+1];
			s = i;
			let l = s.lastIndexOf('.');
			if(l > 0){
				s = s.substring(0, l);
			}
		}
	} else if(process.argv[k] === '-p'){
		let x = parseFloat(process.argv[k+1]);
		if(isFinite(x) === true){
			if((x > 0) && (x < 1)){
				p = x;
			}
		}
	}
}
if(Object.prototype.toString.call(i) === '[object String]'){
	let firstPass = readline.createInterface({
		input: fs.createReadStream(i),
		output: process.stdout,
		terminal: false
	});
	let n = 0;
	firstPass.on('line', function(line){
		line = line.trim();
		if(line.length > 0){
			n++;
		}
		return(false);
	}).on('close', function(){
		if(n > 4294967295){
			process.stderr.write('The number of elements included in the bloom filter (n = ' + n + ') is greater that 4,294,967,295; the filter may perform poorly.', 'UTF8');
		}
		xxhash().then(function(xx){
			let m = Math.ceil((n*Math.log(p))/Math.log(1/Math.pow(2, Math.log(2)))); /* number of bits in the filter; from https://hur.st/bloomfilter/ */
			let k = Math.round((m/n)*Math.log(2)); /* number of hash functions; from https://hur.st/bloomfilter/ */
			m = Math.ceil(m/32)*32; /* rounded up to the next multiple of 32 */
			let b = new Uint32Array(Math.ceil(m/32));
			let secondPass = readline.createInterface({
				input: fs.createReadStream(i),
				output: process.stdout,
				terminal: false
			});
			secondPass.on('line', function(line){
				line = line.trim();
				if(line.length > 0){
					let h = xx.h64(line);
					let hk = parseInt(h.substring(0, 8), 16)%m;
					let hb = parseInt(h.substring(8, 16), 16);
					for(let j = k-1; j >= 0; j--){
						if(hk < 0){
							b[Math.floor((hk+m)/32)] |= (1 << ((hk+m)%32));
						} else {
							b[Math.floor(hk/32)] |= (1 << (hk%32));
						}
						hk = (hk+hb)%m;
					}
				}
				return(false);
			}).on('close', function(){
				fs.writeFile(s + '.json', JSON.stringify({
					f: [].slice.call(b), /* Bloom filter */
					i: i, /* input file */
					k: k, /* number of hash functions */
					m: m, /* number of bits in the filter */
					n: n, /* number of items in the filter */
					p: p  /* probability of false positives */
				}) + '\n', 'UTF8', function(e){
					if(e !== null){
						process.stderr.write('writeFile JSON error: ' + e + '\n', 'UTF8');
					}
				});
				let pbf = new Pbf();
				filter.write({
					f: [].slice.call(b), /* Bloom filter */
					k: k, /* number of hash functions */
					m: m, /* number of bits in the filter */
				}, pbf);
				fs.writeFile(s + '.pbf', pbf.finish(), function(e){
					if(e !== null){
						process.stderr.write('writeFile pbf error: ' + e + '\n', 'UTF8');
					}
				});
				return(false);
			});
			return(false);
		});
	});
} else {
	let o	=	'\nA JavaScript for creating a Bloom filter from lists of words.\n'
			+	'This script requies pbf and xxhash-wasm.\n'
			+	'Input data should have one word per line.\n'
			+	'usage: txt2bloomfilter.js -i input-file.txt [ -p probability of false positives (default = ' + p + ') ]\n\n';
	process.stderr.write(o, 'UTF8');
}
