/* imports from module */
import { RegularExpression, genusClean, nomenClean, spp, sspp } from './regular-expression';
import { ScientificName } from './scientific-name';
export class Extractor {
	private regularExpression: RegularExpression = new RegularExpression();
	constructor(){
	}
	private checkExtract(x: ScientificName): ScientificName {
		if(((x.hasOwnProperty('Genus') === true) && (x.Genus.length >= 2)) || ((x.hasOwnProperty('nothogenus') === true) && (x.nothogenus.length >= 1))){
			if(((x.hasOwnProperty('species') === true) && (x.species.length >= 2)) || ((x.hasOwnProperty('nothospecies') === true) && (x.nothospecies.length >= 1))){
				x.extracted = true;
				if(x.hasOwnProperty('nothogenus') === true){
					for(let k = x.nothogenus.length-1; k >= 0; k--){
						if(x.nothogenus[k].length < 2){
							x.extracted = false;
						}
					}
				}
				if(x.hasOwnProperty('nothospecies') === true){
					for(let k = x.nothospecies.length-1; k >= 0; k--){
						if(x.nothospecies[k].length < 2){
							x.extracted = false;
						}
					}
				}
			}
		}
		if((x.hasOwnProperty('subspecies') === true) && (x.subspecies.length < 2)){
			delete(x.subspecies);
		}
		if((x.hasOwnProperty('species') === true) && (x.hasOwnProperty('subspecies') === true) && (x.species.length === 2)){
			const s = x.subspecies.split('')[0] + '.';
			if(x.species === s){
				x.species = x.subspecies;
			}
		}
		if((x.hasOwnProperty('variety') === true) && (x.variety.length < 2)){
			delete(x.variety);
		}
		if((x.hasOwnProperty('forma') === true) && (x.forma.length < 2)){
			delete(x.forma);
		}
		return(x);
	}
	public formatGenus(x: string): string {
		if(x == null){
			return('');
		} else {
			const y: string = x.replace(this.regularExpression.nothogenus, genusClean);
			let z: string = '';
			if(y.charAt(0) === '⨉'){
				z = '⨉' + y.charAt(1).toUpperCase().replace(this.regularExpression.antiUpperCase, '') + y.substr(2, ).toLowerCase().replace(this.regularExpression.antiLowerCase, '');
			} else {
				z = y.charAt(0).toUpperCase().replace(this.regularExpression.antiUpperCase, '') + y.substr(1, ).toLowerCase().replace(this.regularExpression.antiLowerCase, '');
			}
			return(z);
		}
	}
	private formatSpecies(x: string, c: boolean): string {
		if(x == null){
			return('');
		} else {
			const y: string = x.split(this.regularExpression.closingExtras)[0].replace(this.regularExpression.nothospecies, nomenClean).toLowerCase().replace(this.regularExpression.antiLowerCase, '');
			if(this.regularExpression.abbreviatedSpecies(y, c) === true){
				return(y);
			} else {
				return(y.replace(this.regularExpression.endPeriod, '').replace(this.regularExpression.sp, spp));
			}
		}
	}
	private formatSubspecies(x: string): string {
		if(x == null){
			return('');
		} else {
			return(x.split(this.regularExpression.closingExtras)[0].replace(this.regularExpression.nomen, nomenClean).toLowerCase().replace(this.regularExpression.antiLowerCase, '').replace(this.regularExpression.endPeriod, '').replace(this.regularExpression.ssp, sspp));
		}
	}
	private formatVarietyForma(x: string): string {
		if(x == null){
			return('');
		} else {
			return(x.split(this.regularExpression.closingExtras)[0].replace(this.regularExpression.nomen, nomenClean).toLowerCase().replace(this.regularExpression.antiLowerCase, '').replace(this.regularExpression.endPeriod, ''));
		}
	}
	public scientificName(x: string, c: boolean): ScientificName {
		const n = new ScientificName();
		if(x != null){
			const y: Array<string> = x.replace(this.regularExpression.openingExtras, '').split(' ');
			let i: number = 0;
			if(this.regularExpression.nothogenusFormula(y[i] + ' ' + y[i+1] + ' ' + y[i+2], c) === true){
				n.nothogenus = [
					this.formatGenus(y[i]),
					this.formatGenus(y[i+2])
				];
				i += 3;
			} else if(this.regularExpression.nGenus(y[i], c) === true){
				n.nothogenus = [this.formatGenus(y[i])];
				i++;
			} else {
				n.Genus = this.formatGenus(y[i]);
				i++;
			}
			if(this.regularExpression.abbreviatedSection(y[i]) === true){
				i++;
			} else if(this.regularExpression.section(y[i], c) === true){
				i += 2;
			}
			if((this.regularExpression.affinis(y[i], c) === true) || (this.regularExpression.conferatur(y[i], c) === true) || (this.regularExpression.questionMark(y[i]) === true)){
				i++;
			} else if(this.regularExpression.speciesAffinis(y[i], y[i+1], c) === true){
				i += 2;
			}
			if(this.regularExpression.nothoFormula(y[i+1]) === true){
				if((this.regularExpression.name(y[i], true, c) === true) && (this.regularExpression.name(y[i+2], true, c) === true)){
					n.nothospecies = [
						this.formatSpecies(y[i], c),
						this.formatSpecies(y[i+2], c)
					];
					if(this.regularExpression.endName(y[i+2], c) === true){
						return(this.checkExtract(n));
					}
					i += 3;
				} else {
					return(this.checkExtract(n));
				}
			} else if(this.regularExpression.nothoFormula(y[i]) === true){
				if(this.regularExpression.name(y[i+1], true, c) === true){
					n.nothospecies = [this.formatSpecies('⨉' + y[i+1], c)];
					if(this.regularExpression.endName(y[i+1], c) === true){
						return(this.checkExtract(n));
					}
					i += 2;
				} else {
					return(this.checkExtract(n));
				}
			} else if(this.regularExpression.nSpecies(y[i], c) === true){
				n.nothospecies = [this.formatSpecies(y[i], c)];
				if(this.regularExpression.endName(y[i], c) === true){
					return(this.checkExtract(n));
				}
				i++;
			} else if(this.regularExpression.name(y[i], true, c) === true){
				n.species = this.formatSpecies(y[i], c);
				if((this.regularExpression.endName(y[i], c) === true) || (this.regularExpression.ambiguousSpecies(y[i], c) === true)){
					return(this.checkExtract(n));
				}
				i++;
			} else {
				return(this.checkExtract(n));
			}
			for(let k = 0; k < 5; k++){
				if(this.regularExpression.subspecies(y[i+k], c) === true){
					if(this.regularExpression.name(y[i+k+1], true, c) === true){
						n.subspecies = this.formatSubspecies(y[i+k+1]);
						if(this.regularExpression.endName(y[i+k+1], c) === true){
							return(this.checkExtract(n));
						}
						i += k+2;
					} else if(this.regularExpression.name(y[i+k], true, c) === true){
						n.subspecies = this.formatSubspecies(y[i+k]);
						if(this.regularExpression.endName(y[i+k], c) === true){
							return(this.checkExtract(n));
						}
						i += k+1;
					}
					break;
				} else if((k === 0) && (this.regularExpression.name(y[i], false, c) === true) && (this.regularExpression.authorString(y[i+1], c) === false) && (this.regularExpression.variety(y[i], c) === false) && (this.regularExpression.forma(y[i], c) === false)){ /* fucking animals */
					n.subspecies = this.formatSubspecies(y[i]);
					return(this.checkExtract(n));
				}
			}
			for(let k = 0; k < 5; k++){
				if(this.regularExpression.variety(y[i+k], c) === true){
					if(this.regularExpression.name(y[i+k+1], true, c) === true){
						n.variety = this.formatVarietyForma(y[i+k+1]);
						if(this.regularExpression.endName(y[i+k+1], c) === true){
							return(this.checkExtract(n));
						}
						i += k+2;
					}
					break;
				}
			}
			for(let k = 0; k < 5; k++){
				if(this.regularExpression.forma(y[i+k], c) === true){
					if(this.regularExpression.name(y[i+k+1], true, c) === true){
						n.forma = this.formatVarietyForma(y[i+k+1]);
					}
					break;
				}
			}
		}
		return(this.checkExtract(n));
	}
}
