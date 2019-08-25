interface AlphaEncoderInt32Array {
	[key: string]: Int32Array;
	' ': Int32Array;
	'a': Int32Array;
	'b': Int32Array;
	'c': Int32Array;
	'd': Int32Array;
	'e': Int32Array;
	'f': Int32Array;
	'g': Int32Array;
	'h': Int32Array;
	'i': Int32Array;
	'j': Int32Array;
	'k': Int32Array;
	'l': Int32Array;
	'm': Int32Array;
	'n': Int32Array;
	'o': Int32Array;
	'p': Int32Array;
	'q': Int32Array;
	'r': Int32Array;
	's': Int32Array;
	't': Int32Array;
	'u': Int32Array;
	'v': Int32Array;
	'w': Int32Array;
	'x': Int32Array;
	'y': Int32Array;
	'z': Int32Array;
}
interface AlphaEncoderNumber {
	[key: string]: number;
	' ': number;
	'a': number;
	'b': number;
	'c': number;
	'd': number;
	'e': number;
	'f': number;
	'g': number;
	'h': number;
	'i': number;
	'j': number;
	'k': number;
	'l': number;
	'm': number;
	'n': number;
	'o': number;
	'p': number;
	'q': number;
	'r': number;
	's': number;
	't': number;
	'u': number;
	'v': number;
	'w': number;
	'x': number;
	'y': number;
	'z': number;
}
export const c2i: AlphaEncoderNumber = {
	' ': 0,
	'a': 1,
	'b': 2,
	'c': 3,
	'd': 4,
	'e': 5,
	'f': 6,
	'g': 7,
	'h': 8,
	'i': 9,
	'j': 10,
	'k': 11,
	'l': 12,
	'm': 13,
	'n': 14,
	'o': 15,
	'p': 16,
	'q': 17,
	'r': 18,
	's': 19,
	't': 20,
	'u': 21,
	'v': 22,
	'w': 23,
	'x': 24,
	'y': 25,
	'z': 26
};
export const injectivePhones: AlphaEncoderInt32Array = { /* based on the Eudex hash (https://github.com/ticki/eudex) */
						/*	    +------------------------ vowel
								 |  +--------------------- closer than ɜ
								 |  |  +------------------ close
								 |  |  |  +--------------- front
								 |  |  |  |  +------------ close–mid
								 |  |  |  |  |  +--------- central
								 |  |  |  |  |  |  +------ open–mid
								 |  |  |  |  |  |  |  +--- discriminant
								 |  |  |  |  |  |  |  | */
	' ': Int32Array.from([1, 1, 1, 1, 1, 1, 1, 1]),
	'a': Int32Array.from([0, 2, 2, 2, 2, 0, 2, 2]),
	'b': Int32Array.from([2, 2, 0, 2, 2, 0, 2, 2]),
	'c': Int32Array.from([2, 2, 2, 2, 2, 0, 0, 2]),
	'd': Int32Array.from([2, 2, 2, 2, 0, 0, 2, 2]),
	'e': Int32Array.from([0, 0, 2, 0, 0, 2, 2, 2]),
	'f': Int32Array.from([2, 2, 0, 2, 2, 2, 0, 2]),
	'g': Int32Array.from([2, 2, 2, 2, 2, 0, 2, 2]),
	'h': Int32Array.from([2, 2, 2, 2, 2, 2, 0, 2]),
	'i': Int32Array.from([0, 0, 0, 0, 0, 2, 2, 2]),
	'j': Int32Array.from([2, 2, 2, 2, 2, 2, 0, 0]),
	'k': Int32Array.from([2, 2, 2, 2, 2, 0, 2, 0]),
	'l': Int32Array.from([2, 0, 2, 0, 2, 2, 2, 2]),
	'm': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 0]),
	'n': Int32Array.from([2, 2, 2, 2, 0, 2, 2, 0]),
	'o': Int32Array.from([0, 2, 2, 0, 2, 0, 2, 2]),
	'p': Int32Array.from([2, 2, 0, 2, 2, 0, 2, 0]),
	'q': Int32Array.from([2, 0, 2, 0, 2, 0, 2, 2]),
	'r': Int32Array.from([2, 0, 2, 0, 2, 2, 2, 0]),
	's': Int32Array.from([2, 2, 2, 2, 0, 2, 0, 2]),
	't': Int32Array.from([2, 2, 2, 2, 0, 0, 0, 2]),
	'u': Int32Array.from([0, 0, 0, 2, 2, 2, 2, 2]),
	'v': Int32Array.from([2, 2, 0, 2, 2, 2, 0, 0]),
	'w': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 2]),
	'x': Int32Array.from([2, 0, 2, 2, 2, 2, 0, 2]),
	'y': Int32Array.from([0, 0, 0, 2, 2, 0, 2, 2]),
	'z': Int32Array.from([2, 0, 2, 2, 0, 2, 0, 2])
};
export const phones: AlphaEncoderInt32Array = { /* based on the Eudex hash (https://github.com/ticki/eudex) */
						/*	    +------------------------ confident
								 |  +--------------------- labial
								 |  |  +------------------ liquid
								 |  |  |  +--------------- dental
								 |  |  |  |  +------------ plosive
								 |  |  |  |  |  +--------- fricative
								 |  |  |  |  |  |  +------ nasal
								 |  |  |  |  |  |  |  +--- discriminant
								 |  |  |  |  |  |  |  | */
	' ': Int32Array.from([1, 1, 1, 1, 1, 1, 1, 1]),
	'a': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 2]),
	'b': Int32Array.from([2, 0, 2, 2, 0, 2, 2, 2]),
	'c': Int32Array.from([2, 2, 2, 2, 0, 0, 2, 2]),
	'd': Int32Array.from([2, 2, 2, 0, 0, 2, 2, 2]),
	'e': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 2]),
	'f': Int32Array.from([2, 0, 2, 2, 2, 0, 2, 2]),
	'g': Int32Array.from([2, 2, 2, 2, 0, 2, 2, 2]),
	'h': Int32Array.from([2, 2, 2, 2, 2, 0, 2, 2]),
	'i': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 0]),
	'j': Int32Array.from([2, 2, 2, 2, 2, 0, 2, 0]),
	'k': Int32Array.from([2, 2, 2, 2, 0, 2, 2, 0]),
	'l': Int32Array.from([0, 2, 0, 2, 2, 2, 2, 2]),
	'm': Int32Array.from([2, 2, 2, 2, 2, 2, 0, 2]),
	'n': Int32Array.from([2, 2, 2, 0, 2, 2, 0, 2]),
	'o': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 2]),
	'p': Int32Array.from([2, 0, 2, 2, 0, 2, 2, 0]),
	'q': Int32Array.from([0, 2, 0, 2, 0, 2, 2, 2]),
	'r': Int32Array.from([0, 2, 0, 2, 2, 2, 2, 0]),
	's': Int32Array.from([2, 2, 2, 0, 2, 0, 2, 2]),
	't': Int32Array.from([2, 2, 2, 0, 0, 0, 2, 0]),
	'u': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 0]),
	'v': Int32Array.from([2, 0, 2, 2, 2, 0, 2, 0]),
	'w': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 2]),
	'x': Int32Array.from([0, 2, 2, 2, 2, 0, 2, 2]),
	'y': Int32Array.from([2, 2, 2, 2, 2, 2, 2, 0]),
	'z': Int32Array.from([0, 2, 2, 0, 2, 0, 2, 2])
};
