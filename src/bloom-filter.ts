/* imports from node_modules */
const Pbf = require('pbf'); /* an import statement causes problems */
/* imports from module */
import { XXhash } from './xxhash';
export class Filter {
	f: Uint32Array; /* Bloom filter */
	k: number; /* number of hash functions */
	m: number; /* number of bits in the filter */
}
export class BloomFilter {
	private bf: Filter;
	private filter = { /* manually created from the output of 'node_modules/pbf/bin/pbf src/app/bloom-filter.proto' */
		_readField: function(tag: number, obj: Filter, pbf: any){ /* pbf is really type Pbf, but imports... */
			if(tag === 1){
				pbf.readPackedFixed32(obj.f);
			} else if(tag === 2){
				obj.k = pbf.readVarint(true);
			} else if(tag === 3){
				obj.m = pbf.readVarint(true);
			}
		},
		read: function(pbf: any, end?: number){ /* pbf is really type Pbf, but imports... */
			return(pbf.readFields(this._readField, { /* using 'new Filter()' here would be best practice, but it fails */
				f: [],
				k: 0,
				m: 0
			}, end));
		}
	};
	private xxhash: XXhash = new XXhash();
	constructor(){
	}
	public load(x: ArrayBuffer): boolean {
		this.bf = this.filter.read(new Pbf(x));
		return((this.bf.f.length > 0) && (this.bf.k > 0) && (this.bf.m > 0));
	}
	public async query(q: string): Promise<number> { /* based on Kirsch and Mitzenmache (2008; DOI 10.1002/rsa.20208) using just one 64-bit hash see http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once */
		const h: string = await this.xxhash.h64(q);
		let hk: number = parseInt(h.substring(0, 8), 16)%this.bf.m;
		const hb: number = parseInt(h.substring(8, 16), 16);
		for(let k = this.bf.k-1; k >= 0; k--){
			if(hk < 0){
				if((this.bf.f[Math.floor((hk+this.bf.m)/32)] & (1 << ((hk+this.bf.m)%32))) === 0){
					return(0);
				}
			} else {
				if((this.bf.f[Math.floor(hk/32)] & (1 << (hk%32))) === 0){
					return(0);
				}
			}
			hk = (hk+hb)%this.bf.m;
		}
		return(1);
	}
}
