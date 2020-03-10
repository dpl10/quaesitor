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
	private bf: Array<Filter> = [];
	private filter = { /* manually created from the output of 'node_modules/pbf/bin/pbf bloom-filter.proto' */
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
	public load(x: ArrayBuffer, y: number): boolean {
		this.bf[y] = this.filter.read(new Pbf(x));
		return((this.bf[y].f.length > 0) && (this.bf[y].k > 0) && (this.bf[y].m > 0));
	}
	public loadArray(f: Uint32Array, k: number, m: number, x: number): boolean {
		this.bf[x] = new Filter();
		this.bf[x].f = f;
		this.bf[x].k = k;
		this.bf[x].m = m;
		return((this.bf[x].f.length > 0) && (this.bf[x].k > 0) && (this.bf[x].m > 0));
	}
	public async query(q: string, f: number): Promise<number> { /* based on Kirsch and Mitzenmache (2008; DOI 10.1002/rsa.20208) using just one 64-bit hash see http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once */
		const h: string = await this.xxhash.h64(q);
		let hk: number = parseInt(h.substring(0, 8), 16)%this.bf[f].m;
		const hb: number = parseInt(h.substring(8, 16), 16);
		for(let k = this.bf[f].k-1; k >= 0; k--){
			if(hk < 0){
				if((this.bf[f].f[Math.floor((hk+this.bf[f].m)/32)] & (1 << ((hk+this.bf[f].m)%32))) === 0){
					return(0);
				}
			} else {
				if((this.bf[f].f[Math.floor(hk/32)] & (1 << (hk%32))) === 0){
					return(0);
				}
			}
			hk = (hk+hb)%this.bf[f].m;
		}
		return(1);
	}
}
