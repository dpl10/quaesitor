class Name {
	forma?: string;
	Genus?: string;
	species?: string;
	subspecies?: string;
	variety?: string;
}
export class ScientificName extends Name {
	protected static SInit = (() => {
		ScientificName.prototype.extracted = false;
	})();
	public extracted: boolean;
	public formatName(html: boolean = false): string {
		let x: string = '';
		if(this.hasOwnProperty('Genus') === true){
			if(html === true){
				x = '<i>' + this.Genus + '</i>';
			} else {
				x = this.Genus || '';
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
			} else {
				x = '';
			}
		}
		return(x);
	}
}
