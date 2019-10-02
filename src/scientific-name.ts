class Name {
	forma?: string;
	Genus?: string;
	nothogenus?: Array<string>;
	nothospecies?: Array<string>;
	species?: string;
	subspecies?: string;
	variety?: string;
}
export class ScientificName extends Name {
	[key: string]: any;
	protected static SInit = (() => {
		ScientificName.prototype.extracted = false;
	})();
	public extracted: boolean;
	private alpha(x: string, y: string): number {
		if(x < y){
			return(-1);
		} else if(x > y){
			return(1);
		} else {
			return(0);
		}
	}
	public formatName(html: boolean = false): string {
		let x: string = '';
		if((this.hasOwnProperty('Genus') === true) || (this.hasOwnProperty('nothogenus') === true)){
			if(this.hasOwnProperty('Genus') === true){
				if(html === true){
					x = '<i>' + this.Genus + '</i>';
				} else {
					x = this.Genus || '';
				}
			} else if(this.hasOwnProperty('nothogenus')){
				if(this.nothogenus.length === 1){
					if(html === true){
						x = '<i>' + this.nothogenus[0] + '</i>';
					} else {
						x = this.nothogenus[0] || '';
					}
				} else {
					if(html === true){
						x = '<i>' + this.nothogenus.sort(this.alpha).join('</i> ⨉ <i>') + '</i>';
					} else {
						x =  this.nothogenus.sort(this.alpha).join(' ⨉ ');
					}
				}
			}
			if(this.hasOwnProperty('species') === true){
				if((html === true) && (this.species !== 'sp.') && (this.species !== 'spp.')){
					x += ' <i>' + this.species + '</i>';
				} else {
					x += ' ' + this.species;
				}
				if(this.hasOwnProperty('subspecies') === true){
					if((html === true) && (this.subspecies !== 'subspp.') && (this.subspecies !== 'ssp.')){
						x += ' subsp. <i>' + this.subspecies + '</i>';
					} else if((this.subspecies === 'subspp.') || (this.subspecies === 'ssp.')){
						x += ' subspp.';
					} else {
						x += ' subsp. ' + this.subspecies;
					}
				}
				if(this.hasOwnProperty('variety') === true){
					if(html === true){
						x += ' var. <i>' + this.variety + '</i>';
					} else {
						x += ' var. ' + this.variety;
					}
				}
				if(this.hasOwnProperty('forma') === true){
					if(html === true){
						x += ' f. <i>' + this.forma + '</i>';
					} else {
						x += ' f. ' + this.forma;
					}
				}
			} else if(this.hasOwnProperty('nothospecies') === true){
				if(this.nothospecies.length === 1){
					if(html === true){
						x += ' <i>' + this.nothospecies[0] + '</i>';
					} else {
						x += ' ' + this.nothospecies[0];
					}
				} else {
					if(html === true){
						x += ' <i>' + this.nothospecies.sort(this.alpha).join('</i> ⨉ <i>') + '</i>';
					} else {
						x += ' ' + this.nothospecies.sort(this.alpha).join(' ⨉ ');
					}
				}
			} else {
				x = '';
			}
		}
		return(x);
	}
}
