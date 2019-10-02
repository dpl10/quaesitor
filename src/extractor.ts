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
			}
		}
		return(x);
	}
	private formatGenus(x: string): string {
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
	private formatSpecies(x: string): string {
		if(x == null){
			return('');
		} else {
			return(x.replace(this.regularExpression.sp, spp).replace(this.regularExpression.nothospecies, nomenClean).toLowerCase().replace(this.regularExpression.antiLowerCase, ''));
		}
	}
	private formatSubspecies(x: string): string {
		if(x == null){
			return('');
		} else {
			return(x.replace(this.regularExpression.ssp, sspp).replace(this.regularExpression.nomen, nomenClean).toLowerCase().replace(this.regularExpression.antiLowerCase, ''));
		}
	}
	private formatVarietyForma(x: string): string {
		if(x == null){
			return('');
		} else {
			return(x.replace(this.regularExpression.nomen, nomenClean).toLowerCase().replace(this.regularExpression.antiLowerCase, ''));
		}
	}
	public scientificName(x: string): ScientificName {
		const n = new ScientificName();
		if(x != null){
			const y: Array<string> = x.replace(this.regularExpression.openingExtras, '').replace(this.regularExpression.closingExtras, '').split(' ');
			let i: number = 0;
// only works for 2...
			if(this.regularExpression.nothoFormula(y[i+1]) === true){
				n.nothogenus = [
					this.formatGenus(y[i]),
					this.formatGenus(y[i+2])
				];
				i += 3;
			} else if(this.regularExpression.nGenus(y[i]) === true){
				n.nothogenus = [this.formatGenus(y[i])];
				i++;
			} else {
				n.Genus = this.formatGenus(y[i]);
				i++;
			}
			if(this.regularExpression.abbreviatedSection(y[i]) === true){
				i++;
			} else if(this.regularExpression.section(y[i]) === true){
				i += 2;
			}
			if(this.regularExpression.conferatur(y[i]) === true){
				i++;
			}
// only works for 2...
			if(this.regularExpression.nothoFormula(y[i+1]) === true){
				n.nothospecies = [
					this.formatSpecies(y[i]),
					this.formatSpecies(y[i+2])
				];
				if(this.regularExpression.endName(n.nothospecies[1]) === true){
					return(this.checkExtract(n));
				}
				i += 3;
			} else if(this.regularExpression.nSpecies(y[i])){
				n.nothospecies = [this.formatSpecies(y[i])];
				if(this.regularExpression.endName(n.nothospecies[0]) === true){
					return(this.checkExtract(n));
				}
				i++;
			} else {
				n.species = this.formatSpecies(y[i]);
				if(this.regularExpression.endName(n.species) === true){
					return(this.checkExtract(n));
				}
				i++;
			}
			for(let k = 0; k < 5; k++){
				if(this.regularExpression.subspecies(y[i+k]) === true){
					if(this.regularExpression.name(y[i+k+1]) === true){
						n.subspecies = this.formatSubspecies(y[i+k+1]);
						i += k+2;
					} else {
						n.subspecies = this.formatSubspecies(y[i+k]);
						i += k+1;
					}
					if(this.regularExpression.endName(n.subspecies) === true){
						return(this.checkExtract(n));
					}
					break;
				} else if((k === 0) && (this.regularExpression.name(y[i]) === true) && (this.regularExpression.authorString(y[i+1]) === false)){
					n.subspecies = this.formatSubspecies(y[i]);
					if(this.regularExpression.endName(n.subspecies) === true){
						return(this.checkExtract(n));
					}
					i++;
					break;
				}
			}
			for(let k = 0; k < 5; k++){
				if(this.regularExpression.variety(y[i+k]) === true){
					if(this.regularExpression.name(y[i+k+1]) === true){
						n.variety = this.formatVarietyForma(y[i+k+1]);
						if(this.regularExpression.endName(n.variety) === true){
							return(this.checkExtract(n));
						}
						i += k+2;
					}
					break;
				}
			}
			for(let k = 0; k < 5; k++){
				if(this.regularExpression.forma(y[i+k]) === true){
					if(this.regularExpression.name(y[i+k+1]) === true){
						n.forma = this.formatVarietyForma(y[i+k+1]);
					}
					break;
				}
			}
		}
		return(this.checkExtract(n));
	}
}
