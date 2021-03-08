/* imports from node_modules */
const LRUCache = require('mnemonist/lru-cache'); /* an import statement causes problems */
/* imports from module */
import { Classifier } from './classifier';
import { Extractor } from './extractor';
import { RegularExpression, bufferCapture, insertSpace } from './regular-expression';
import { ScientificName } from './scientific-name';
import { XXhash } from './xxhash';
export class Abbreviation {
	[key: string]: AbbreviationRecord;
}
export class AbbreviationRecord {
	[key: string]: string;
	expansion: string;
	public constructor(init ?: Partial<AbbreviationRecord>){
		Object.assign(this, init);
	}
}
export class Quaesitor {
	private classifier: Classifier = new Classifier();
	private extract: Extractor = new Extractor();
	private queryCacheBinomial = new LRUCache(8192); /* LRUCache<string, boolean> */
	private queryCacheUninomial = new LRUCache(8192); /* LRUCache<string, boolean> */
	private regularExpression: RegularExpression = new RegularExpression();
	private xxhash: XXhash = new XXhash();
	constructor(){
	}
	private abbreviate(a: Abbreviation, g: string, s: string, o: boolean): Abbreviation {
		const lg = g.length-1;
		const ls = s.length-1;
		for(let k = 2; k > 0; k--){ /* generic and specific abbreviations up to 2 letters */
			const ge: string = g.substring(0, (lg < k) ? lg : k) + '.';
			if(o === true){
				const sp: string = s.substring(0, (ls < k) ? ls : k) + '.';
				a[this.formatSpecies(g, sp)] = new AbbreviationRecord({
					expansion: s
				});
				a[this.formatSpecies(ge, sp)] = new AbbreviationRecord({
					expansion: s
				});
			}
			a[ge] = new AbbreviationRecord({
				expansion: g
			});
		}
		return(a);
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
		let a: Abbreviation = new Abbreviation();
		let m: RegExpExecArray|null;
		const e: Array<ScientificName> = [];
		const y = ' ' + x.normalize('NFC').replace(this.regularExpression.html, '').replace(this.regularExpression.unusualPunctuation, ' ').replace(this.regularExpression.lineEnding, '\n').replace(this.regularExpression.separator, ' ').replace(this.regularExpression.missingSpace, insertSpace).replace(this.regularExpression.dash, '-').replace(this.regularExpression.dashPlus, '-').replace(this.regularExpression.spaceDashEnd, ' - ').replace(this.regularExpression.dashEnd, '').replace(this.regularExpression.symbolRemoval, bufferCapture).replace(this.regularExpression.pluralPossesive, ' ').replace(this.regularExpression.synonym, '').replace(this.regularExpression.questionable, '').replace(this.regularExpression.endLine, ' ').replace(this.regularExpression.spacePlus, ' ');
		while((m = this.regularExpression.nomenNudem.exec(y)) !== null){
			let c: boolean = false;
			let m1: string = m[1];
			let m2: string = m[2];
			if((m[1] == null) && (m[2] == null)){
				c = true;
				m1 = m[3];
				m2 = m[4];
			}
			const g: boolean = this.regularExpression.abbreviatedGenus(m1, c);
			const s: boolean = this.regularExpression.abbreviatedSpecies(m2, c);
			let n: ScientificName = new ScientificName();
			const q = y.substr(m.index);
			if((g === true) && (s === true)){
				n = this.extract.scientificName(q, c);
				if(n.extracted === true){
					if((n.hasOwnProperty('Genus') === true) && (a.hasOwnProperty(n.Genus) === true)){
						n.Genus = a[n.Genus].expansion;
					}
					if((n.hasOwnProperty('Genus') === true) && (n.hasOwnProperty('species') === true)){
						const sp = this.formatSpecies(n.Genus, n.species);
						if(a.hasOwnProperty(sp) === true){
							n.species = a[sp].expansion;
						}
					}
				}
			} else if(g === true){
				if(await this.queryUninomial(m2) === true){
					n = this.extract.scientificName(q, c);
					if((n.extracted === true) && (n.hasOwnProperty('Genus') === true) && (a.hasOwnProperty(n.Genus) === true)){
						n.Genus = a[n.Genus].expansion;
						if(n.hasOwnProperty('species') === true){
							a = this.abbreviate(a, n.Genus, n.species, false);
						}
					}
				}
			} else if(s === true){
				if(await this.queryUninomial(m1) === true){
					n = this.extract.scientificName(q, c);
					if((n.extracted === true) && (n.hasOwnProperty('Genus') === true) && (n.hasOwnProperty('species') === true)){
						const sp = this.formatSpecies(n.Genus, n.species);
						if(a.hasOwnProperty(sp) === true){
							n.species = a[sp].expansion;
						}
					}
				}
			} else if(await this.queryBinomial(m1, m2) === true){
				n = this.extract.scientificName(q, c);
				if((n.extracted === true) && (n.hasOwnProperty('Genus') === true) && (n.hasOwnProperty('species') === true)){
					a = this.abbreviate(a, n.Genus, n.species, true);
				}
			}
			if(n.extracted === true){
				for(const p in n){
					if(((p === 'forma') || (p === 'subspecies') || (p === 'variety')) && (await this.queryUninomial(n[p]) === false)){
						delete(n[p]);
					}
				}
				e.push(n);
			}
		}
		const h: any = {};
		const u: Array<string> = [];
		for(let k = e.length-1; k >= 0; k--){
			if((e[k].hasOwnProperty('Genus') === true) && (this.regularExpression.abbreviatedGenus(e[k].Genus, false) === true) && (a.hasOwnProperty(e[k].Genus) === true)){
				e[k].Genus = a[e[k].Genus].expansion;
			}
			if((e[k].hasOwnProperty('Genus') === true) && (e[k].hasOwnProperty('species') === true) && (this.regularExpression.abbreviatedSpecies(e[k].species, false) === true)){
				const sp = this.formatSpecies(e[k].Genus, e[k].species);
				if(a.hasOwnProperty(sp) === true){
					e[k].species = a[sp].expansion;
				}
			}
			const f: string = e[k].formatName(htmlFormat);
			const h64: string = await this.xxhash.h64(f);
			if(h.hasOwnProperty(h64) === false){
				h[h64] = true;
				u.push(f);
			}
		}
		return(u.sort(this.alpha));
	}
	private formatSpecies(g: string, s: string): string {
		return(g + ' ' + s);
	}
	public async loadClassifiers(): Promise<void> {
		this.classifier.load();
	}
	private async queryBinomial(x: string, y: string): Promise<boolean> {
		const z = this.formatSpecies(x, y).toLowerCase();
		if(this.queryCacheBinomial.has(z) === true){
			return(this.queryCacheBinomial.get(z) as boolean);
		} else if(await this.classifier.queryKLUGE(z) === 1){
			this.queryCacheBinomial.set(z, false);
			return(false);
		} else {
			const r: boolean = await this.classifier.queryBEDFFNN(await this.classifier.queryEnsemble(x), await this.classifier.queryEnsemble(y));
			this.queryCacheBinomial.set(z, r);
			return(r);
		}
	}
	private async queryUninomial(x: string): Promise<boolean> {
		const y = x.toLowerCase();
		if(this.queryCacheUninomial.has(y) === true){
			return(this.queryCacheUninomial.get(y) as boolean);
		} else {
			const r: boolean = await this.classifier.queryUEDFFNN(await this.classifier.queryEnsemble(x));
			this.queryCacheUninomial.set(y, r);
			return(r);
		}
	}
}
