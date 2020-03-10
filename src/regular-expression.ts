/* imports from node_modules */
import * as XRegExp from 'xregexp';
/* unicode for regular expressions... because JavaScript is painful. */
const u = {
	LatinLowerCase: '\\u0061-\\u007A\\u00DF-\\u00F6\\u00F8-\\u00FF\\u0101\\u0101\\u0103\\u0103\\u0105\\u0105\\u0107\\u0107\\u0109\\u0109\\u010B\\u010B\\u010D\\u010D\\u010F\\u010F\\u0111\\u0111\\u0113\\u0113\\u0115\\u0115\\u0117\\u0117\\u0119\\u0119\\u011B\\u011B\\u011D\\u011D\\u011F\\u011F\\u0121\\u0121\\u0123\\u0123\\u0125\\u0125\\u0127\\u0127\\u0129\\u0129\\u012B\\u012B\\u012D\\u012D\\u012F\\u012F\\u0131\\u0131\\u0133\\u0133\\u0135\\u0135\\u0137-\\u0138\\u013A\\u013A\\u013C\\u013C\\u013E\\u013E\\u0140\\u0140\\u0142\\u0142\\u0144\\u0144\\u0146\\u0146\\u0148-\\u0149\\u014B\\u014B\\u014D\\u014D\\u014F\\u014F\\u0151\\u0151\\u0153\\u0153\\u0155\\u0155\\u0157\\u0157\\u0159\\u0159\\u015B\\u015B\\u015D\\u015D\\u015F\\u015F\\u0161\\u0161\\u0163\\u0163\\u0165\\u0165\\u0167\\u0167\\u0169\\u0169\\u016B\\u016B\\u016D\\u016D\\u016F\\u016F\\u0171\\u0171\\u0173\\u0173\\u0175\\u0175\\u0177\\u0177\\u017A\\u017A\\u017C\\u017C\\u017E-\\u0180\\u0183\\u0183\\u0185\\u0185\\u0188\\u0188\\u018C-\\u018D\\u0192\\u0192\\u0195\\u0195\\u0199-\\u019B\\u019E\\u019E\\u01A1\\u01A1\\u01A3\\u01A3\\u01A5\\u01A5\\u01A8\\u01A8\\u01AB\\u01AB\\u01AD\\u01AD\\u01B0\\u01B0\\u01B4\\u01B4\\u01B6\\u01B6\\u01B9-\\u01BA\\u01BD\\u01BD\\u01C6\\u01C6\\u01C9\\u01C9\\u01CC\\u01CC\\u01CE\\u01CE\\u01D0\\u01D0\\u01D2\\u01D2\\u01D4\\u01D4\\u01D6\\u01D6\\u01D8\\u01D8\\u01DA\\u01DA\\u01DC-\\u01DD\\u01DF\\u01DF\\u01E1\\u01E1\\u01E3\\u01E3\\u01E5\\u01E5\\u01E7\\u01E7\\u01E9\\u01E9\\u01EB\\u01EB\\u01ED\\u01ED\\u01EF-\\u01F0\\u01F3\\u01F3\\u01F5\\u01F5\\u01F9\\u01F9\\u01FB\\u01FB\\u01FD\\u01FD\\u01FF\\u01FF', /* https://www.utf8-chartable.de/unicode-utf8-table.pl; grep 'LATIN SMALL' latin.txt | awk '{print $1}' | perl -pe 's/U\+/0x/' | awk --non-decimal-data 'BEGIN{x=0;}{if($1""==x""){print("-")}else{print(y"\n"$1)};x=sprintf("0x%04X",$1+1);y=$1}END{print(y)}' | perl -pe 's/0x/\\\\u/' | tr -d '\n' | perl -pe 'tr/-/-/s' */
	LatinUpperCase: '\\u0041-\\u005A\\u00C0-\\u00D6\\u00D8-\\u00DE\\u0100\\u0100\\u0102\\u0102\\u0104\\u0104\\u0106\\u0106\\u0108\\u0108\\u010A\\u010A\\u010C\\u010C\\u010E\\u010E\\u0110\\u0110\\u0112\\u0112\\u0114\\u0114\\u0116\\u0116\\u0118\\u0118\\u011A\\u011A\\u011C\\u011C\\u011E\\u011E\\u0120\\u0120\\u0122\\u0122\\u0124\\u0124\\u0126\\u0126\\u0128\\u0128\\u012A\\u012A\\u012C\\u012C\\u012E\\u012E\\u0130\\u0130\\u0132\\u0132\\u0134\\u0134\\u0136\\u0136\\u0139\\u0139\\u013B\\u013B\\u013D\\u013D\\u013F\\u013F\\u0141\\u0141\\u0143\\u0143\\u0145\\u0145\\u0147\\u0147\\u014A\\u014A\\u014C\\u014C\\u014E\\u014E\\u0150\\u0150\\u0152\\u0152\\u0154\\u0154\\u0156\\u0156\\u0158\\u0158\\u015A\\u015A\\u015C\\u015C\\u015E\\u015E\\u0160\\u0160\\u0162\\u0162\\u0164\\u0164\\u0166\\u0166\\u0168\\u0168\\u016A\\u016A\\u016C\\u016C\\u016E\\u016E\\u0170\\u0170\\u0172\\u0172\\u0174\\u0174\\u0176\\u0176\\u0178-\\u0179\\u017B\\u017B\\u017D\\u017D\\u0181-\\u0182\\u0184\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2\\u01A2\\u01A4\\u01A4\\u01A7\\u01A7\\u01A9\\u01A9\\u01AC\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B5\\u01B7-\\u01B8\\u01BC\\u01BC\\u01C4-\\u01C5\\u01C7-\\u01C8\\u01CA-\\u01CB\\u01CD\\u01CD\\u01CF\\u01CF\\u01D1\\u01D1\\u01D3\\u01D3\\u01D5\\u01D5\\u01D7\\u01D7\\u01D9\\u01D9\\u01DB\\u01DB\\u01DE\\u01DE\\u01E0\\u01E0\\u01E2\\u01E2\\u01E4\\u01E4\\u01E6\\u01E6\\u01E8\\u01E8\\u01EA\\u01EA\\u01EC\\u01EC\\u01EE\\u01EE\\u01F1-\\u01F2\\u01F4\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FA\\u01FC\\u01FC\\u01FE\\u01FE', /* https://www.utf8-chartable.de/unicode-utf8-table.pl; grep 'LATIN CAPITAL' latin.txt | awk '{print $1}' | perl -pe 's/U\+/0x/' | awk --non-decimal-data 'BEGIN{x=0;}{if($1""==x""){print("-")}else{print(y"\n"$1)};x=sprintf("0x%04X",$1+1);y=$1}END{print(y)}' | perl -pe 's/0x/\\\\u/' | tr -d '\n' | perl -pe 'tr/-/-/s' */
	alpha: '\\u{03B1}\\u{237A}\\u{1D6C2}\\u{1D6FC}\\u{1D736}\\u{1D770}\\u{1D7AA}',
	beta: '\\u{03B2}\\u{1D5D}\\u{1D66}\\u{1D6C3}\\u{1D6FD}\\u{1D737}\\u{1D771}\\u{1D7AB}',
	bracketOpen: '\\u007B\\u0028\\u005B',
	bracketClose: '\\u007D\\u0029\\u005D',
	cross: '\\u00D7\\u2A2F\\u2715\\u2A09\\u2716',
	dagger: '\\u2020',
	gamma: '\\u{03B3}\\u{1D67}\\u{0194}\\u{0263}\\u{0264}\\u{1D6C4}\\u{1D6FE}\\u{1D7AC}\\u{02E0}\\u{1D5E}',
	quoteOpen: '\\u00AB\\u2039\\u201C\\u201F\\u2018\\u201B\\u0022\\u275B\\u275D\\u276E\\uFF02\\u0027',
	quoteClose: '\\u0022\\u0027\\u00BB\\u2019\\u201A\\u201D\\u201E\\u203A\\u275C\\u276F\\u301D\\u301E\\u301F\\uFF02',
	restrictedPunctuation: '\\u2000-\\u200F\\u2016\\u2017\\u2021-\\u2023\\u2025-\\u2031\\u203B-\\u204D\\u204F-\\u205E'
};
/* replacer functions */
export function bufferCapture(_m: string, x: string, _o: number, _s: string): string {
	return(' ' + x + ' ');
}
export function genusClean(_m: string, x: string, y: string, z: string, _o: number, _s: string): string {
	let n: string = '';
	if(x.length > 0){
		n = '⨉';
	}
	return(n + y + z);
}
export function insertSpace(_m: string, x: string, y: string, _o: number, _s: string): string {
	return(x + ' ' + y);
}
export function nomenClean(_m: string, x: string, y: string, z: string, _o: number, _s: string): string {
	let n: string = '';
	if(x.length > 0){
		n = '⨉';
	}
	return(n + y + z);
}
export function spp(_m: string, p: string, _o: number, _s: string): string {
	return('s' + p + '.');
}
export function sspp(_m: string, p: string, _o: number, _s: string): string {
	return('subs' + p + '.');
}
export class RegularExpression {
	constructor(){
	}
	private ABBRGENUS: RegExp = new RegExp('^[' + u.LatinUpperCase + ']{1,2}[.]$'); /* generic abbreviations up to 2 letters */
	private abbrGenus: RegExp = new RegExp('^[' + u.LatinUpperCase + '][' + u.LatinLowerCase +']{0,1}[.]$'); /* generic abbreviations up to 2 letters */
	private ABBRSPECIES: RegExp = new RegExp('^[' + u.LatinUpperCase + '][.]$'); /* specific abbreviations up to 1 letter */
	private abbrSpecies: RegExp = new RegExp('^[' + u.LatinUpperCase + u.LatinLowerCase + '][.]$'); /* specific abbreviations up to 1 letter */
	private AFF: RegExp = new RegExp(/^AFF\.|AFFIN\.|SP\.AFF\.$/);
	private aff: RegExp = new RegExp(/^aff\.|affin\.|sp\.aff\.$/);
	public antiASCIIlowerCase: RegExp = new RegExp(/[^a-z]/, 'g');
	public antiLowerCase: RegExp = new RegExp('[^' + u.LatinLowerCase + u.cross + '.]', 'g');
	public antiUpperCase: RegExp = new RegExp('[^' + u.LatinUpperCase + ']', 'g');
	private AUTHORSTUFF: RegExp = new RegExp(/^(?:&|AND|EMEND\.|ET|EX|IN)$/);
	private authorStuff: RegExp = new RegExp(/^(?:&|and|emend\.|et|ex|in)$/);
	private CF: RegExp = new RegExp(/^C\.{0,1}F\.$/);
	private cf: RegExp = new RegExp(/^c\.{0,1}f\.$/);
	public closingExtras: RegExp = new RegExp('[' + u.quoteClose + u.quoteOpen + u.bracketOpen + u.bracketClose + ']');
	public cruff: RegExp = new RegExp(/[ɨⅱaắằẵẳặấầẫẩậǎảȃạªbcdḍeếềễểệẽẻẹəfgǵǧhḩḥiǐỉịjkḱlḷmnṅṇoốồỗổộỏọơớờỡởợºpqrṛṟsṡșṣtțṭṯuǔủụưứừữửựvwxyỳỹȳỷzẓ]/, 'g');
	public dash: RegExp = XRegExp('[\\p{Dash_Punctuation}]', 'g');
	public dashEnd: RegExp = new RegExp(/-\n/, 'g');
	public dashPlus: RegExp = new RegExp(/-+/, 'g');
	private end: RegExp = new RegExp('[!?*=\\/:;,' + u.dagger + u.quoteClose + u.bracketClose + '-]$');
	public endLine: RegExp = new RegExp(/\n/, 'g');
	public endPeriod: RegExp = new RegExp(/[.]$/);
	private FM: RegExp = new RegExp(/^(?:F\.|FM\.|FO\.|FMA\.|FORM|MORPH)$/);
	private fm: RegExp = new RegExp(/^(?:f\.|fm\.|fo\.|fma\.|form|morph)$/);
	private fmSymbol: RegExp = new RegExp('^[' + u.gamma + ']$', 'u');
	public html: RegExp = new RegExp('<[^/].*?>|</.+?>', 'g');
	public leadingSpace: RegExp = new RegExp(/^ +/);
	public lineEnding: RegExp = new RegExp(/\r\n|\r|\n/, 'g');
	public missingSpace: RegExp = new RegExp('([' + u.LatinUpperCase + '][.])([' + u.LatinUpperCase + u.LatinLowerCase + ']{2,})', 'g');
	private Namish: RegExp = new RegExp('^[' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{1,}[' + u.dagger + u.quoteClose + u.bracketClose + '!?*=\\/:,;.]{0,}$');
	private NAMISH: RegExp = new RegExp('^[' + u.LatinUpperCase + ']{1,}[' + u.dagger + u.quoteClose + u.bracketClose + '!?*=\\/:,;.]{0,}$');
	private namish: RegExp = new RegExp('^[' + u.LatinLowerCase + ']{2,}[' + u.dagger + u.quoteClose + u.bracketClose + '!?*=\\/:,;.]{0,}$');
	public nomen: RegExp = new RegExp('^([' + u.cross + ']{0,1})([' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{1,})([.]{0,1})$');
	public nomenNudem: RegExp = new RegExp('(?=(?:(?:(?:[' + u.cross + u.dagger + u.quoteOpen + u.bracketOpen + 'x-]{1,2}| {1,1})((?:[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{1,}|[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{0,1}[.])|(?:[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{1,}|[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{0,1}[.]) [' + u.cross + 'Xx] (?:[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{1,}|[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{0,1}[.])) (?:(?:[?]|aff[.]|affin[.]|sp[.]aff[.]|sp[.] aff[.]|sp[.]affin[.]|sp[.] affin[.]|cf[.]) ){0,1}(?:(?:(?:sect[.] |§)(?:[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{1,}|[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{0,1}[.]) )|(?:(?:[(](?:[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{1,}|[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{0,1}[.])[)] ))){0,1}(?:[' + u.cross + ']|(?:[' + u.cross + 'Xx] )){0,1}((?:sp{1,2}[.])|[' + u.LatinLowerCase + '][.]|[' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{2,})))|(?:(?:(?:[' + u.cross + u.dagger + u.quoteOpen + u.bracketOpen + 'x-]{1,2}| {1,1})((?:[' + u.LatinUpperCase + ']{2,}|[' + u.LatinUpperCase + ']{1,2}[.])|(?:[' + u.LatinUpperCase + ']{2,}|[' + u.LatinUpperCase + ']{1,2}[.]) [' + u.cross + 'Xx] (?:[' + u.LatinUpperCase + ']{2,}|[' + u.LatinUpperCase + ']{1,2}[.])) (?:(?:[?]|AFF[.]|AFFIN[.]|SP[.]AFF[.]|SP[.] AFF[.]|SP[.]AFFIN[.]|SP[.] AFFIN[.]|CF[.]) ){0,1}(?:(?:(?:SECT[.] |§)(?:[' + u.LatinUpperCase + ']{2,}|[' + u.LatinUpperCase + ']{1,2}[.]) )|(?:(?:[(](?:[' + u.LatinUpperCase + ']{2,}|[' + u.LatinUpperCase + ']{1,2}[.])[)] ))){0,1}(?:[' + u.cross + ']|(?:[' + u.cross + 'Xx] )){0,1}((?:SP{1,2}[.])|[' + u.LatinLowerCase + '][.]|[' + u.LatinUpperCase + ']{2,})))).', 'g'); /* generic abbreviations up to 3 letters; specific abbreviations up to 1 letter */
	private notho: RegExp = new RegExp('^[' + u.cross + 'Xx]$');
	public NOTHOGENUS: RegExp = new RegExp('^([' + u.cross + 'x])([' + u.LatinUpperCase + ']{1,})([.]{0,1})$'); /* unlimited generic abbreviations */
	public nothogenus: RegExp = new RegExp('^([' + u.cross + 'Xx])([' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{1,})([.]{0,1})$'); /* unlimited generic abbreviations */
	public NOTHOGENUSFORMULA: RegExp = new RegExp('^[' + u.LatinUpperCase + '](?:(?:[' + u.LatinUpperCase + ']{1,})|(?:[' + u.LatinUpperCase +']{0,1}[.])) [' + u.cross + 'Xx] [' + u.LatinUpperCase + '](?:(?:[' + u.LatinUpperCase + ']{1,})|(?:[' + u.LatinUpperCase +']{0,1}[.]))$'); /* generic abbreviations up to 2 letters */
	public nothoGenusFormula: RegExp = new RegExp('^[' + u.LatinUpperCase + '](?:(?:[' + u.LatinLowerCase + ']{1,})|(?:[' + u.LatinLowerCase +']{0,1}[.])) [' + u.cross + 'Xx] [' + u.LatinUpperCase + '](?:(?:[' + u.LatinLowerCase + ']{1,})|(?:[' + u.LatinLowerCase +']{0,1}[.]))$'); /* generic abbreviations up to 2 letters */
	public NOTHOSPECIES: RegExp = new RegExp('^([' + u.cross + ']|(?:[' + u.cross + 'x](?=[' + u.LatinUpperCase + '])))([' + u.LatinUpperCase + ']{1,})([.]{0,1})$'); /* unlimited specific abbreviations */
	public nothospecies: RegExp = new RegExp('^([' + u.cross + ']|(?:[' + u.cross + 'x](?=[' + u.LatinUpperCase + '])))([' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{1,})([.]{0,1})$');  /* unlimited specific abbreviations */
	public openingExtras: RegExp = new RegExp('^[ ' + u.dagger + u.quoteOpen + u.bracketOpen + '-]+', 'g');
	public pluralPossesive: RegExp = new RegExp(/[\u0027\u2019\u275C]s /, 'g');
	private question: RegExp = new RegExp(/^[?]$/);
	public questionable: RegExp = new RegExp('[' + u.bracketOpen + '][ ]+[?][ ]+[' + u. bracketClose + ']', 'g');
	private SECT: RegExp = new RegExp(/^SECT\./);
	private sect: RegExp = new RegExp(/^sect\./);
	private sectionAbbr: RegExp = new RegExp(/^[§(]/);
	public separator: RegExp = XRegExp('\\p{Separator}+', 'g');
	public sp: RegExp = new RegExp(/^s(p{1,2})[.]{0,1}$/);
	public spaceDashEnd: RegExp = new RegExp(/ -\n/, 'g');
	public spacePlus: RegExp = new RegExp(/ +/, 'g');
	public SPECIES: RegExp = new RegExp(/^(?:SP{1,2}[.]{0,1})|SPECIES$/);
	public species: RegExp = new RegExp(/^(?:sp{1,2}[.]{0,1})|species$/);
	public ssp: RegExp = new RegExp(/^s(?:ub){0,1}s(p{1,2})[.]{0,1}$/);
	private SUBSP: RegExp = new RegExp(/^S(?:UB){0,1}S(?:P{1,2})[.]{0,1}$/);
	private subsp: RegExp = new RegExp(/^s(?:ub){0,1}s(?:p{1,2})[.]{0,1}$/);
	private subspSymbol: RegExp = new RegExp('^[' + u.alpha + ']$', 'u');
	public symbolRemoval: RegExp = new RegExp(/([!?*=~:;,|+\/0-9]+)/, 'g');
	public synonym: RegExp = new RegExp('[(][ ]+=[ ]+(?:(?:[' + u.LatinUpperCase + '][' + u.LatinLowerCase + ']{1,})|(?:[' + u.LatinUpperCase + ']{2,}))[ ]{0,1}[)]', 'g');
	public trailingSpace: RegExp = new RegExp(/ +$/);
	public unusualPunctuation: RegExp = new RegExp('[' + u.restrictedPunctuation + ']+', 'g');
	private VAR: RegExp = new RegExp(/^(?:VARIETY|VAR\.)$/);
	private var: RegExp = new RegExp(/^(?:variety|var\.)$/);
	private varSymbol: RegExp = new RegExp('^[' + u.beta + ']$', 'u');
	public abbreviatedGenus(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.ABBRGENUS.test(x));
			} else {
				return(this.abbrGenus.test(x));
			}
		} else {
			return(false);
		}
	}
	public abbreviatedSection(x: any): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else {
				return(this.sectionAbbr.test(x));
			}
		} else {
			return(false);
		}
	}
	public abbreviatedSpecies(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.ABBRSPECIES.test(x));
			} else {
				return(this.abbrSpecies.test(x));
			}
		} else {
			return(false);
		}
	}
	public affinis(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.AFF.test(x));
			} else {
				return(this.aff.test(x));
			}
		} else {
			return(false);
		}
	}
	public ambiguousSpecies(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.SPECIES.test(x));
			} else {
				return(this.species.test(x));
			}
		} else {
			return(false);
		}
	}
	public authorString(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.AUTHORSTUFF.test(x));
			} else {
				return(this.authorStuff.test(x));
			}
		} else {
			return(false);
		}
	}
	public conferatur(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.CF.test(x));
			} else {
				return(this.cf.test(x));
			}
		} else {
			return(false);
		}
	}
	public endName(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(this.end.test(x) === true){
				return(true);
			} else if((c === true) && (this.ABBRSPECIES.test(x) === true)){
				return(false);
			} else if((c === false) && (this.abbrSpecies.test(x) === true)){
				return(false);
			} else {
				return(this.endPeriod.test(x));
			}
		} else {
			return(false);
		}
	}
	public forma(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if((c === true) && (this.FM.test(x) === true)){
				return(true);
			} else if((c === false) && (this.fm.test(x) === true)){
				return(true);
			} else {
				return(this.fmSymbol.test(x));
			}
		} else {
			return(false);
		}
	}
	public name(x: any, i: boolean, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else {
				const y: Array<string> = x.split(/-/);
				for(let k = y.length-1; k >= 0; k--){
					if((c === true) && (this.NAMISH.test(y[k]) === false)){
						return(false);
					} else if((c === false) && (i === true) && (this.Namish.test(y[k]) === false)){
						return(false);
					} else if((c === false) && (i === false) && (this.namish.test(y[k]) === false)){
						return(false);
					}
				}
				return(true);
			}
		} else {
			return(false);
		}
	}
	public nGenus(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.NOTHOGENUS.test(x));
			} else {
				return(this.nothogenus.test(x));
			}
		} else {
			return(false);
		}
	}
	public nothoFormula(x: any): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else {
				return(this.notho.test(x));
			}
		} else {
			return(false);
		}
	}
	public nothogenusFormula(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.NOTHOGENUSFORMULA.test(x));
			} else {
				return(this.nothoGenusFormula.test(x));
			}
		} else {
			return(false);
		}
	}
	public nSpecies(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.NOTHOSPECIES.test(x));
			} else {
				return(this.nothospecies.test(x));
			}
		} else {
			return(false);
		}
	}
	public questionMark(x: any): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else {
				return(this.question.test(x));
			}
		} else {
			return(false);
		}
	}
	public section(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if(c === true){
				return(this.SECT.test(x));
			} else {
				return(this.sect.test(x));
			}
		} else {
			return(false);
		}
	}
	public speciesAffinis(x: any, y: string, c: boolean): boolean {
		if((this.string(x) === true) && (this.string(y) === true)){
			if((x == null) || (y == null)){
				return(false);
			} else if(c === true){
				return(this.SPECIES.test(x) && this.AFF.test(y));
			} else {
				return(this.species.test(x) && this.aff.test(y));
			}
		} else {
			return(false);
		}
	}
	public string(x: any): boolean {
		return(Object.prototype.toString.call(x) === '[object String]');
	}
	public subspecies(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if((c === true) && (this.SUBSP.test(x) === true)){
				return(true);
			} else if((c === false) && (this.subsp.test(x) === true)){
				return(true);
			} else {
				return(this.subspSymbol.test(x));
			}
		} else {
			return(false);
		}
	}
	public variety(x: any, c: boolean): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else if((c === true) && (this.VAR.test(x) === true)){
				return(true);
			} else if((c === false) && (this.var.test(x) === true)){
				return(true);
			} else {
				return(this.varSymbol.test(x));
			}
		} else {
			return(false);
		}
	}
}
