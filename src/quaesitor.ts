/* imports from node_modules */
const LRUCache = require('mnemonist/lru-cache'); /* an import statement causes problems */
/* imports from module */
import { Flatten } from './flatten';
import { Model } from './model';
import { Network } from './network';
import { RegularExpression, exclusionSet, dash, html, separator } from './regular-expression';
import { ScientificName } from './scientific-name';
import { XXhash } from './xxhash';
export class Quaesitor {
	private flatten: Flatten = new Flatten();
	private network: Network = new Network();
	private queryCache = new LRUCache(8192); /* LRUCache<string, boolean> */
	private regularExpression: RegularExpression = new RegularExpression();
	private xxhash: XXhash = new XXhash();
	constructor(){
	}
	public async extractSpecies(x: string, htmlFormat: boolean): Promise<Array<string>> {
		const taxa: Array<ScientificName> = [];
		const y = x.normalize('NFC').replace(html, '').replace(dash, '-').replace(/-+/g, '-').replace(/ -\n/g, ' - ').replace(/-\n/g, '').replace(separator, ' ').replace(/\r\n|\r|\n/g, ' ').replace(/ +/g, ' ').split(/ /);
		for(let k = y.length-1; k >= 0; k--){
			if((y[k] != null) && (exclusionSet.test(y[k]) === false)){ /* removes all non-Latin languages from consideration */
				let z: ScientificName = new ScientificName();
				let max: number = 20; /* assuming a max of three authors (four tokens): Genus(1) species(2) author(3-6) subsp.(7) subspecies(8) author(9-12) var.(13) variety(14) author(15-18) f.(19) forma(20) */
				if((y.length-k) < max){
					max = y.length-1;
				} else {
					max += k;
				}
				for(let j = max; j > k; j--){
					if((y[j] === 'subsp.') || (y[j] === 'var.') || (y[j] === 'f.') || (y[j] === 'fm.')){
						z = this.regularExpression.scientificNameExtract(y.slice(k, j+2).join(' '));
						break;
					}
				}
				if(z.extracted === false){
					z = this.regularExpression.scientificNameExtract(y.slice(k, k+3).join(' '));
					if(z.extracted === false){
						z = this.regularExpression.scientificNameExtract(y.slice(k, k+2).join(' '));
					}
				}
				if(z.extracted === true){
					let insert: boolean = true;
					for(const name in z){
						if((name === 'Genus') && (this.regularExpression.abbreviatedGenus(z.Genus) === true)){
							continue;
						} else if(((name === 'Genus') || (name === 'species')) && (await this.query(z[name]) === false)){
							insert = false;
							break;
						} else if(((name === 'forma') || (name === 'subspecies') || (name === 'variety')) && (await this.query(z[name]) === false)){
							delete(z[name]);
						}
					}
					if(insert === true){
						taxa.push(z);
					} else {
					}
				}
			}
		}
		let currentGenus: string = '';
		let currentGenusAbbreviated: RegExp = new RegExp(/^[]/);
		const h: any = {};
		const uniq: Array<string> = [];
		for(let k = taxa.length-1; k >= 0; k--){
			if(this.regularExpression.abbreviatedGenus(taxa[k].Genus) === true){
				if((currentGenus.length > 0) && (currentGenusAbbreviated.test(taxa[k].Genus) === true)){
					taxa[k].Genus = currentGenus;
				}
			} else {
				currentGenus = taxa[k].Genus;
				let r: string = '^' + taxa[k].Genus.charAt(0) + taxa[k].Genus.charAt(1) + '{0,1}';
				if(taxa[k].Genus.length >= 3){
					r += taxa[k].Genus.charAt(2) + '{0,1}';
				}
				currentGenusAbbreviated = new RegExp(r + '\.$');
			}
			const t: string = taxa[k].formatName(htmlFormat);
			const h64: string = await this.xxhash.h64(t);
			if(h[h64] === undefined){
				h[h64] = true;
				uniq.push(t);
			}
		}
		return(uniq);
	}
	public async loadNetworks(x: Model): Promise<void> {
		this.network.load(x);
	}
	private async query(x: string): Promise<boolean> {
		if(this.queryCache.has(x) === true){
			return(this.queryCache.get(x));
		} else {
			let r: boolean = false;
			const q = new Float32Array(3).fill(0.0);
			const y: string = this.flatten.squash(x);
			const z: Array<string> = y.replace(/[^a-z]/g, ' ').split('');
			q[0] = await this.network.queryECNN(z);
			q[1] = await this.network.queryLCNN(z);
			q[2] = await this.network.queryPCNN(y);
			if(await this.network.queryEDFFNN(q) > 0.5){
				r = true;
			}
			this.queryCache.set(x, r);
			return(r);
		}
	}
}
