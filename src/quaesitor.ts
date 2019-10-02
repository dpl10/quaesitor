/* imports from node_modules */
const LRUCache = require('mnemonist/lru-cache'); /* an import statement causes problems */
/* imports from module */
import { Classifier } from './classifier';
import { Classifiers } from './model';
import { Extractor } from './extractor';
import { RegularExpression } from './regular-expression';
import { ScientificName } from './scientific-name';
import { XXhash } from './xxhash';
export class Quaesitor {
	private classifier: Classifier = new Classifier();
	private extract: Extractor = new Extractor();
	private queryCacheBinomial = new LRUCache(8192); /* LRUCache<string, boolean> */
	private queryCacheUninomial = new LRUCache(8192); /* LRUCache<string, boolean> */
	private regularExpression: RegularExpression = new RegularExpression();
	private xxhash: XXhash = new XXhash();
	constructor(){
	}
	private alpha(x: string, y: string): number {
		if(x < y){
			return(-1);
		} else if(x > y){
			return(1);
		} else {
			return(0);
		}
	}
	public async extractSpecies(x: string, htmlFormat: boolean): Promise<Array<string>> {
		const a: any = {};
		const h: any = {};
		let m: RegExpExecArray|null;
		const u: Array<string> = [];
		const y = x.normalize('NFC').replace(this.regularExpression.html, '').replace(this.regularExpression.lineEnding, '\n').replace(this.regularExpression.separator, ' ').replace(this.regularExpression.dash, '-').replace(/-+/g, '-').replace(/ -\n/g, ' - ').replace(/-\n/g, '').replace(/\n/g, ' ').replace(/ +/g, ' ');
		while((m = this.regularExpression.nomenNudem.exec(y)) !== null){
			const g = this.regularExpression.abbreviatedGenus(m[1]);
			const s = this.regularExpression.abbreviatedSpecies(m[2]);
			let n: ScientificName = new ScientificName();
			const q = y.substr(m.index);
			if((g === true) && (s === true)){
				n = this.extract.scientificName(q);
				if(n.extracted === true){
					if((n.hasOwnProperty('Genus') === true) && (a.hasOwnProperty(n.Genus) === true)){
						n.Genus = a[n.Genus];
					}
					if((n.extracted === true) && (n.hasOwnProperty('Genus') === true) && (n.hasOwnProperty('species') === true)){
						const sp = this.formatSpecies(n.Genus, n.species);
						if(a.hasOwnProperty(sp) === true){
							n.species = a[sp];
						}
					}
				}
			} else if(g === true){
				if(await this.queryUninomial(m[2]) === true){
					n = this.extract.scientificName(q);
					if((n.extracted === true) && (n.hasOwnProperty('Genus') === true) && (a.hasOwnProperty(n.Genus) === true)){
						n.Genus = a[n.Genus];
					}
				}
			} else if(s === true){
				if(await this.queryUninomial(m[1]) === true){
					n = this.extract.scientificName(q);
					if((n.extracted === true) && (n.hasOwnProperty('Genus') === true) && (n.hasOwnProperty('species') === true)){
						const sp = this.formatSpecies(n.Genus, n.species);
						if(a.hasOwnProperty(sp) === true){
							n.species = a[sp];
						}
					}
				}
			} else if(await this.queryBinomial(m[1], m[2]) === true){
				n = this.extract.scientificName(q);
				if((n.extracted === true) && (n.hasOwnProperty('Genus') === true) && (n.hasOwnProperty('species') === true)){
					const lg = n.Genus.length-1;
					const ls = n.species.length-1;
					for(let k = 3; k > 0; k--){
						let kg = k;
						let ks = k;
						if(lg < k){
							kg = lg;
						}
						if(ls < k){
							ks = ls;
						}
						const ge: string = n.Genus.substring(0, kg) + '.';
						const sp: string = n.species.substring(0, ks) + '.';
						a[ge] = n.Genus;
						a[this.formatSpecies(n.Genus, sp)] = n.species;
						a[this.formatSpecies(ge, sp)] = n.species;
					}
				}
			}
			if(n.extracted === true){
				for(const p in n){
					if(((p === 'forma') || (p === 'subspecies') || (p === 'variety')) && (await this.queryUninomial(n[p]) === false)){
						delete(n[p]);
					}
				}
				const f: string = n.formatName(htmlFormat);
				const h64: string = await this.xxhash.h64(f);
				if(h.hasOwnProperty(h64) === false){
					h[h64] = true;
					u.push(f);
				}
			}
		}
// test all found genera or species to get additional compbinations species using more permissive threshold?
		return(u.sort(this.alpha));
	}
	private formatSpecies(g: string, s: string): string {
		return(g + ' ' + s);
	}
	public async loadClassifiers(x: Classifiers): Promise<void> {
		this.classifier.load(x);
	}
	private async queryBinomial(x: string, y: string): Promise<boolean> {
		const s = x + ' ' + y;
		if(this.queryCacheBinomial.has(s) === true){
			return(this.queryCacheBinomial.get(s));
		} else {
			const r: boolean = this.classifier.queryBELDA(await this.classifier.queryEnsemble(x), await this.classifier.queryEnsemble(y));
			this.queryCacheBinomial.set(s, r);
			return(r);
		}
	}
	private async queryUninomial(x: string): Promise<boolean> {
		if(this.queryCacheUninomial.has(x) === true){
			return(this.queryCacheUninomial.get(x));
		} else {
			const r: boolean = this.classifier.queryUELDA(await this.classifier.queryEnsemble(x));
			this.queryCacheUninomial.set(x, r);
			return(r);
		}
	}
}
