/* imports from node_modules */
import { deburr } from 'lodash';
export class Flatten {
	private exchage: any = {
		'ɨ': 'i',
		'ⅱ': 'i',
		'a': 'a',
		'ắ': 'a',
		'ằ': 'a',
		'ẵ': 'a',
		'ẳ': 'a',
		'ặ': 'a',
		'ấ': 'a',
		'ầ': 'a',
		'ẫ': 'a',
		'ẩ': 'a',
		'ậ': 'a',
		'ǎ': 'a',
		'ả': 'a',
		'ȃ': 'a',
		'ạ': 'a',
		'ª': 'a',
		'b': 'b',
		'c': 'c',
		'd': 'd',
		'ḍ': 'd',
		'e': 'e',
		'ế': 'e',
		'ề': 'e',
		'ễ': 'e',
		'ể': 'e',
		'ệ': 'e',
		'ẽ': 'e',
		'ẻ': 'e',
		'ẹ': 'e',
		'ə': 'e',
		'f': 'f',
		'g': 'g',
		'ǵ': 'g',
		'ǧ': 'g',
		'h': 'h',
		'ḩ': 'h',
		'ḥ': 'h',
		'i': 'i',
		'ǐ': 'i',
		'ỉ': 'i',
		'ị': 'i',
		'j': 'j',
		'k': 'k',
		'ḱ': 'k',
		'l': 'l',
		'ḷ': 'l',
		'm': 'm',
		'n': 'n',
		'ṅ': 'n',
		'ṇ': 'n',
		'o': 'o',
		'ố': 'o',
		'ồ': 'o',
		'ỗ': 'o',
		'ổ': 'o',
		'ộ': 'o',
		'ỏ': 'o',
		'ọ': 'o',
		'ơ': 'o',
		'ớ': 'o',
		'ờ': 'o',
		'ỡ': 'o',
		'ở': 'o',
		'ợ': 'o',
		'º': 'o',
		'p': 'p',
		'q': 'q',
		'r': 'r',
		'ṛ': 'r',
		'ṟ': 'r',
		's': 's',
		'ṡ': 's',
		'ș': 's',
		'ṣ': 's',
		't': 't',
		'ț': 't',
		'ṭ': 't',
		'ṯ': 't',
		'u': 'u',
		'ǔ': 'u',
		'ủ': 'u',
		'ụ': 'u',
		'ư': 'u',
		'ứ': 'u',
		'ừ': 'u',
		'ữ': 'u',
		'ử': 'u',
		'ự': 'u',
		'v': 'v',
		'w': 'w',
		'x': 'x',
		'y': 'y',
		'ỳ': 'y',
		'ỹ': 'y',
		'ȳ': 'y',
		'ỷ': 'y',
		'z': 'z',
		'ẓ': 'z'
	};
	constructor(){
	}
	public squash(x: string): string {
		return(deburr(x.normalize('NFC').toLowerCase()).replace(/[ɨⅱaắằẵẳặấầẫẩậǎảȃạªbcdḍeếềễểệẽẻẹəfgǵǧhḩḥiǐỉịjkḱlḷmnṅṇoốồỗổộỏọơớờỡởợºpqrṛṟsṡșṣtțṭṯuǔủụưứừữửựvwxyỳỹȳỷzẓ]/g, (y: string): string => {
			return(this.exchage[y]); })
		);
	}
}
