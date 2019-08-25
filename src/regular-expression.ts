/* imports from node_modules */
import * as XRegExp from 'xregexp';
/* imports from module */
import { ScientificName } from './scientific-name';
/* unicode for regular expressions... because JavaScript is painful. */
const u = {
	LatinLowerCase: '\\u0061-\\u007A\\u00DF-\\u00F6\\u00F8-\\u00FF\\u0101\\u0101\\u0103\\u0103\\u0105\\u0105\\u0107\\u0107\\u0109\\u0109\\u010B\\u010B\\u010D\\u010D\\u010F\\u010F\\u0111\\u0111\\u0113\\u0113\\u0115\\u0115\\u0117\\u0117\\u0119\\u0119\\u011B\\u011B\\u011D\\u011D\\u011F\\u011F\\u0121\\u0121\\u0123\\u0123\\u0125\\u0125\\u0127\\u0127\\u0129\\u0129\\u012B\\u012B\\u012D\\u012D\\u012F\\u012F\\u0131\\u0131\\u0133\\u0133\\u0135\\u0135\\u0137-\\u0138\\u013A\\u013A\\u013C\\u013C\\u013E\\u013E\\u0140\\u0140\\u0142\\u0142\\u0144\\u0144\\u0146\\u0146\\u0148-\\u0149\\u014B\\u014B\\u014D\\u014D\\u014F\\u014F\\u0151\\u0151\\u0153\\u0153\\u0155\\u0155\\u0157\\u0157\\u0159\\u0159\\u015B\\u015B\\u015D\\u015D\\u015F\\u015F\\u0161\\u0161\\u0163\\u0163\\u0165\\u0165\\u0167\\u0167\\u0169\\u0169\\u016B\\u016B\\u016D\\u016D\\u016F\\u016F\\u0171\\u0171\\u0173\\u0173\\u0175\\u0175\\u0177\\u0177\\u017A\\u017A\\u017C\\u017C\\u017E-\\u0180\\u0183\\u0183\\u0185\\u0185\\u0188\\u0188\\u018C-\\u018D\\u0192\\u0192\\u0195\\u0195\\u0199-\\u019B\\u019E\\u019E\\u01A1\\u01A1\\u01A3\\u01A3\\u01A5\\u01A5\\u01A8\\u01A8\\u01AB\\u01AB\\u01AD\\u01AD\\u01B0\\u01B0\\u01B4\\u01B4\\u01B6\\u01B6\\u01B9-\\u01BA\\u01BD\\u01BD\\u01C6\\u01C6\\u01C9\\u01C9\\u01CC\\u01CC\\u01CE\\u01CE\\u01D0\\u01D0\\u01D2\\u01D2\\u01D4\\u01D4\\u01D6\\u01D6\\u01D8\\u01D8\\u01DA\\u01DA\\u01DC-\\u01DD\\u01DF\\u01DF\\u01E1\\u01E1\\u01E3\\u01E3\\u01E5\\u01E5\\u01E7\\u01E7\\u01E9\\u01E9\\u01EB\\u01EB\\u01ED\\u01ED\\u01EF-\\u01F0\\u01F3\\u01F3\\u01F5\\u01F5\\u01F9\\u01F9\\u01FB\\u01FB\\u01FD\\u01FD\\u01FF\\u01FF', /* https://www.utf8-chartable.de/unicode-utf8-table.pl; grep 'LATIN SMALL' latin.txt | awk '{print $1}' | perl -pe 's/U\+/0x/' | awk --non-decimal-data 'BEGIN{x=0;}{if($1""==x""){print("-")}else{print(y"\n"$1)};x=sprintf("0x%04X",$1+1);y=$1}END{print(y)}' | perl -pe 's/0x/\\\\u/' | tr -d '\n' | perl -pe 'tr/-/-/s' */
	LatinUpperCase: '\\u0041-\\u005A\\u00C0-\\u00D6\\u00D8-\\u00DE\\u0100\\u0100\\u0102\\u0102\\u0104\\u0104\\u0106\\u0106\\u0108\\u0108\\u010A\\u010A\\u010C\\u010C\\u010E\\u010E\\u0110\\u0110\\u0112\\u0112\\u0114\\u0114\\u0116\\u0116\\u0118\\u0118\\u011A\\u011A\\u011C\\u011C\\u011E\\u011E\\u0120\\u0120\\u0122\\u0122\\u0124\\u0124\\u0126\\u0126\\u0128\\u0128\\u012A\\u012A\\u012C\\u012C\\u012E\\u012E\\u0130\\u0130\\u0132\\u0132\\u0134\\u0134\\u0136\\u0136\\u0139\\u0139\\u013B\\u013B\\u013D\\u013D\\u013F\\u013F\\u0141\\u0141\\u0143\\u0143\\u0145\\u0145\\u0147\\u0147\\u014A\\u014A\\u014C\\u014C\\u014E\\u014E\\u0150\\u0150\\u0152\\u0152\\u0154\\u0154\\u0156\\u0156\\u0158\\u0158\\u015A\\u015A\\u015C\\u015C\\u015E\\u015E\\u0160\\u0160\\u0162\\u0162\\u0164\\u0164\\u0166\\u0166\\u0168\\u0168\\u016A\\u016A\\u016C\\u016C\\u016E\\u016E\\u0170\\u0170\\u0172\\u0172\\u0174\\u0174\\u0176\\u0176\\u0178-\\u0179\\u017B\\u017B\\u017D\\u017D\\u0181-\\u0182\\u0184\\u0184\\u0186-\\u0187\\u0189-\\u018B\\u018E-\\u0191\\u0193-\\u0194\\u0196-\\u0198\\u019C-\\u019D\\u019F-\\u01A0\\u01A2\\u01A2\\u01A4\\u01A4\\u01A7\\u01A7\\u01A9\\u01A9\\u01AC\\u01AC\\u01AE-\\u01AF\\u01B1-\\u01B3\\u01B5\\u01B5\\u01B7-\\u01B8\\u01BC\\u01BC\\u01C4-\\u01C5\\u01C7-\\u01C8\\u01CA-\\u01CB\\u01CD\\u01CD\\u01CF\\u01CF\\u01D1\\u01D1\\u01D3\\u01D3\\u01D5\\u01D5\\u01D7\\u01D7\\u01D9\\u01D9\\u01DB\\u01DB\\u01DE\\u01DE\\u01E0\\u01E0\\u01E2\\u01E2\\u01E4\\u01E4\\u01E6\\u01E6\\u01E8\\u01E8\\u01EA\\u01EA\\u01EC\\u01EC\\u01EE\\u01EE\\u01F1-\\u01F2\\u01F4\\u01F4\\u01F6-\\u01F8\\u01FA\\u01FA\\u01FC\\u01FC\\u01FE\\u01FE', /* https://www.utf8-chartable.de/unicode-utf8-table.pl; grep 'LATIN CAPITAL' latin.txt | awk '{print $1}' | perl -pe 's/U\+/0x/' | awk --non-decimal-data 'BEGIN{x=0;}{if($1""==x""){print("-")}else{print(y"\n"$1)};x=sprintf("0x%04X",$1+1);y=$1}END{print(y)}' | perl -pe 's/0x/\\\\u/' | tr -d '\n' | perl -pe 'tr/-/-/s' */
};
/* regular expressions */
// add fm. not just f.; add good bits from https://gitlab.com/gogna/gnparser/blob/master/grammar/grammar.peg
export const LatinName: RegExp = XRegExp('^[([]{0,1}\\u2020{0,1}([' + u.LatinUpperCase + '][' + u.LatinLowerCase + '.]{1,}) (?:cf\\. ){0,1}(?:(?:sect\\. |§|\\()[' + u.LatinUpperCase + '][' + u.LatinLowerCase + '.]{1,}\\){0,1} ){0,1}([' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{1,}|sp\\.|spp\\.)(?: ([' + u.LatinLowerCase + ']{1,}|subspp\\.|ssp\\.)|(?:(?:(?=.{0,}[' + u.LatinUpperCase + ']).{2,}){0,1} (subsp\\.)(?! nov\\.) ([' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{1,}|subspp\\.|sspp\\.)){0,1}(?:(?:(?=.{0,}[' + u.LatinUpperCase + ']).{2,}){0,1} (var\\.)(?! nov\\.) ([' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{1,})){0,1}(?:(?:(?=.{0,}[' + u.LatinUpperCase + ']).{2,}){0,1} (f\\.)(?! nov\\.) ([' + u.LatinUpperCase + ']{0,1}[' + u.LatinLowerCase + ']{1,})){0,1}(?:.{1,}){0,1})\\u2020{0,1}[)\\]]{0,1}$');
export const abbrGenus: RegExp = XRegExp('^[' + u.LatinUpperCase + '][' + u.LatinLowerCase +']{0,2}\\.$');
export const dash: RegExp = XRegExp('[\\p{Dash_Punctuation}]', 'g');
export const exclusionSet: RegExp = XRegExp('[^\\p{Latin}\\p{Inherited}.,()\\[\\]<>&\\-†§]');
export const html: RegExp = XRegExp('<[^/].*?>|</.+?>', 'g');
export const separator: RegExp = XRegExp('\\p{Separator}+', 'g');
export class RegularExpression {
	constructor(){
	}
	public abbreviatedGenus(x: any): boolean {
		if(this.string(x) === true){
			if(x == null){
				return(false);
			} else {
				return(abbrGenus.test(x));
			}
		} else {
			return(false);
		}
	}
	public scientificNameExtract(x: string): ScientificName {
		const y = new ScientificName();
		if(x != null){
			const z = LatinName.exec(x);
			if((z != null) && (z[1] != null) && (z[2] != null)){
				y.extracted = true;
				y.Genus = z[1];
				y.species = z[2];
				if(z[3] != null){
					y.subspecies = z[3];
				}
				if((z[4] === 'subsp.') && (z[5] != null)){
					y.subspecies = z[5];
				}
				if((z[6] === 'var.') && (z[7] != null)){
					y.variety = z[7];
				}
				if((z[8] === 'f.') && (z[9] != null)){
					y.forma = z[9];
				}
			}
		}
		return(y);
	}
	public scientificNameTest(x: string): boolean {
		if(x == null){
			return(false);
		} else {
			return(LatinName.test(x));
		}
	}
	public string(x: any): boolean {
		return(Object.prototype.toString.call(x) === '[object String]');
	}
}
