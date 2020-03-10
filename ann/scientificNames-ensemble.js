#!/usr/bin/env node
process.env.TF_CPP_MIN_LOG_LEVEL = '2';
const LTTB = require('downsample').LTTB;
const Pbf = require('pbf');
let b = null;
const c2i = {
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
const deburr = require('lodash/deburr');
let filter = { /* manually constructed from the output of 'node_modules/pbf/bin/pbf ../monographia/src/app/bloom-filter.proto' */
	_readField: function(tag, obj, pbf){
		if(tag === 1){
			pbf.readPackedFixed32(obj.f);
		} else if(tag === 2){
			obj.k = pbf.readVarint(true);
		} else if(tag === 3){
			obj.m = pbf.readVarint(true);
		}
	},
	read: function(pbf, end){
		return(pbf.readFields(this._readField, {f: [], k: 0, m: 0}, end));
	}
};
const fs = require('fs');
let e = null;
function eudex(x, w){
	const injectivePhones = [
		{
			' ': 0.5144053,
			'a': 0.5728202,
			'b': 0.7156174,
			'c': 0.8934104,
			'd': 0.6892541,
			'e': 0.0606695,
			'f': 0.8377482,
			'g': 0.7535173,
			'h': 0.8632705,
			'i': 0.0000000,
			'j': 1.0000000,
			'k': 0.8788425,
			'l': 0.3045298,
			'm': 0.8334726,
			'n': 0.7813263,
			'o': 0.3749506,
			'p': 0.8566013,
			'q': 0.3373866,
			'r': 0.4219646,
			's': 0.8136482,
			't': 0.8651054,
			'u': 0.2728876,
			'v': 0.9901208,
			'w': 0.7274535,
			'x': 0.6486879,
			'y': 0.2986934,
			'z': 0.5896361
		}, {
			' ': 0.4626105,
			'a': 0.0520072,
			'b': 0.0372068,
			'c': 0.3376812,
			'd': 0.3203732,
			'e': 0.6941599,
			'f': 0.5684133,
			'g': 0.1276463,
			'h': 0.6715732,
			'i': 0.5963993,
			'j': 0.6896528,
			'k': 0.1305364,
			'l': 0.5948146,
			'm': 0.4745938,
			'n': 0.6694929,
			'o': 0.0370783,
			'p': 0.0090573,
			'q': 0.2468403,
			'r': 0.6075443,
			's': 0.8687147,
			't': 0.5249564,
			'u': 0.3807648,
			'v': 0.5900379,
			'w': 0.4589975,
			'x': 0.7866334,
			'y': 0.0000000,
			'z': 1.0000000
		}, {
			' ': 0.4399342,
			'a': 0.7141183,
			'b': 0.4152828,
			'c': 0.7559572,
			'd': 0.9396845,
			'e': 0.6881330,
			'f': 0.2307535,
			'g': 0.7439570,
			'h': 0.5600221,
			'i': 0.3620303,
			'j': 0.3531930,
			'k': 0.5384151,
			'l': 0.4786727,
			'm': 0.3282797,
			'n': 0.5470637,
			'o': 0.7825331,
			'p': 0.1943454,
			'q': 0.7011107,
			'r': 0.2679626,
			's': 0.7792769,
			't': 1.0000000,
			'u': 0.0970428,
			'v': 0.0000000,
			'w': 0.5445069,
			'x': 0.4726587,
			'y': 0.3105723,
			'z': 0.7005761
		}, {
			' ': 0.3941421,
			'a': 0.3408635,
			'b': 0.1874485,
			'c': 0.2295147,
			'd': 0.3550054,
			'e': 0.4858643,
			'f': 0.0000000,
			'g': 0.4521324,
			'h': 0.2848427,
			'i': 0.2095092,
			'j': 0.5783338,
			'k': 0.7464389,
			'l': 0.6821555,
			'm': 0.8020725,
			'n': 0.7093604,
			'o': 0.5239148,
			'p': 0.4693275,
			'q': 0.6381095,
			'r': 1.0000000,
			's': 0.1853494,
			't': 0.1294633,
			'u': 0.1114928,
			'v': 0.2972201,
			'w': 0.5111483,
			'x': 0.2863466,
			'y': 0.0681106,
			'z': 0.1938033
		}, {
			' ': 0.7740968,
			'a': 0.4798160,
			'b': 0.5371001,
			'c': 0.2245294,
			'd': 0.7812384,
			'e': 0.6417355,
			'f': 0.3822414,
			'g': 0.3780275,
			'h': 0.2287135,
			'i': 0.8090604,
			'j': 0.4283921,
			'k': 0.5821265,
			'l': 0.1522962,
			'm': 0.5942891,
			'n': 1.0000000,
			'o': 0.4441400,
			'p': 0.7366599,
			'q': 0.1450212,
			'r': 0.3614217,
			's': 0.6339128,
			't': 0.6128483,
			'u': 0.4288614,
			'v': 0.5772154,
			'w': 0.3579271,
			'x': 0.0000000,
			'y': 0.4129549,
			'z': 0.4131548
		}, {
			' ': 1.0000000,
			'a': 0.2576811,
			'b': 0.4432953,
			'c': 0.6231258,
			'd': 0.4441391,
			'e': 0.4143082,
			'f': 0.4107410,
			'g': 0.3626720,
			'h': 0.3328142,
			'i': 0.4664387,
			'j': 0.5276927,
			'k': 0.5623156,
			'l': 0.4849456,
			'm': 0.2355961,
			'n': 0.3348261,
			'o': 0.3949976,
			'p': 0.6283588,
			'q': 0.7911291,
			'r': 0.6651722,
			's': 0.4096892,
			't': 0.7051446,
			'u': 0.2396915,
			'v': 0.5759454,
			'w': 0.0000000,
			'x': 0.5394303,
			'y': 0.5170665,
			'z': 0.5778543
		}, {
			' ': 0.8399256,
			'a': 0.7361091,
			'b': 0.0282645,
			'c': 0.5302222,
			'd': 0.0000000,
			'e': 0.5570019,
			'f': 0.4482001,
			'g': 0.1917753,
			'h': 0.6425381,
			'i': 0.3689673,
			'j': 0.7349129,
			'k': 0.3216705,
			'l': 0.1775697,
			'm': 0.4308594,
			'n': 0.2067914,
			'o': 1.0000000,
			'p': 0.1342094,
			'q': 0.0724206,
			'r': 0.2834001,
			's': 0.4443649,
			't': 0.3266016,
			'u': 0.4193598,
			'v': 0.5067485,
			'w': 0.2472107,
			'x': 0.2905846,
			'y': 0.2767096,
			'z': 0.0693432
		}
	];
	const phones = [
		{
			' ': 0.4741691,
			'a': 0.4965336,
			'b': 0.3052932,
			'c': 0.2567205,
			'd': 0.3811168,
			'e': 0.4965336,
			'f': 0.1841983,
			'g': 0.4226943,
			'h': 0.3162891,
			'i': 0.3580945,
			'j': 0.1829574,
			'k': 0.2736326,
			'l': 1.0000000,
			'm': 0.5349669,
			'n': 0.4826678,
			'o': 0.4965336,
			'p': 0.1060198,
			'q': 0.9340061,
			'r': 0.8679639,
			's': 0.2315562,
			't': 0.0000000,
			'u': 0.3580945,
			'v': 0.0171034,
			'w': 0.4965336,
			'x': 0.6208216,
			'y': 0.3580945,
			'z': 0.5509910
		}, {
			' ': 0.5180467,
			'a': 0.4940936,
			'b': 0.8134794,
			'c': 0.4829158,
			'd': 0.5728787,
			'e': 0.4940936,
			'f': 0.3302627,
			'g': 0.7327688,
			'h': 0.2360982,
			'i': 0.6326232,
			'j': 0.3786544,
			'k': 0.8834334,
			'l': 0.5172847,
			'm': 0.4499312,
			'n': 0.2779488,
			'o': 0.4940936,
			'p': 1.0000000,
			'q': 0.7840569,
			'r': 0.6793185,
			's': 0.0497405,
			't': 0.4642004,
			'u': 0.6326232,
			'v': 0.4791167,
			'w': 0.4940936,
			'x': 0.1713828,
			'y': 0.6326232,
			'z': 0.0000000
		}, {
			' ': 0.5617527,
			'a': 0.4743986,
			'b': 0.3607165,
			'c': 0.3756257,
			'd': 0.0000000,
			'e': 0.4743986,
			'f': 0.6996335,
			'g': 0.2239968,
			'h': 0.6000965,
			'i': 0.7505670,
			'j': 0.8812881,
			'k': 0.4980718,
			'l': 0.6685684,
			'm': 0.3449982,
			'n': 0.0916315,
			'o': 0.4743986,
			'p': 0.5999180,
			'q': 0.4238049,
			'r': 0.9730513,
			's': 0.3334574,
			't': 0.3968823,
			'u': 0.7505670,
			'v': 1.0000000,
			'w': 0.4743986,
			'x': 0.7446887,
			'y': 0.7505670,
			'z': 0.4665964
		}, {
			' ': 0.6985572,
			'a': 0.2229222,
			'b': 0.2342911,
			'c': 0.5371083,
			'd': 0.6420790,
			'e': 0.2229222,
			'f': 0.1542805,
			'g': 0.3916729,
			'h': 0.2926956,
			'i': 0.3870468,
			'j': 0.5313921,
			'k': 0.6119757,
			'l': 0.4146329,
			'm': 0.0000000,
			'n': 0.2588292,
			'o': 0.2229222,
			'p': 0.4289748,
			'q': 0.6435603,
			'r': 0.6489516,
			's': 0.5188652,
			't': 1.0000000,
			'u': 0.3870468,
			'v': 0.3455402,
			'w': 0.2229222,
			'x': 0.4702166,
			'y': 0.3870468,
			'z': 0.7408477
		}, {
			' ': 0.5048927,
			'a': 0.5003000,
			'b': 0.1179955,
			'c': 0.0000000,
			'd': 0.4654195,
			'e': 0.5003000,
			'f': 0.0571030,
			'g': 0.2663222,
			'h': 0.2319604,
			'i': 0.8502760,
			'j': 0.5546483,
			'k': 0.5902124,
			'l': 0.3203018,
			'm': 0.7780515,
			'n': 1.0000000,
			'o': 0.5003000,
			'p': 0.4022710,
			'q': 0.0520850,
			'r': 0.6572023,
			's': 0.4400914,
			't': 0.4972221,
			'u': 0.8502760,
			'v': 0.3549538,
			'w': 0.5003000,
			'x': 0.0379218,
			'y': 0.8502760,
			'z': 0.2860163
		}, {
			' ': 1.0000000,
			'a': 0.0749502,
			'b': 0.4080110,
			'c': 0.0824160,
			'd': 0.2185498,
			'e': 0.0749502,
			'f': 0.4740182,
			'g': 0.0329981,
			'h': 0.0502128,
			'i': 0.0081126,
			'j': 0.0131708,
			'k': 0.0000000,
			'l': 0.2470620,
			'm': 0.2734508,
			'n': 0.4124314,
			'o': 0.0749502,
			'p': 0.3862765,
			'q': 0.2408196,
			'r': 0.2006884,
			's': 0.1928755,
			't': 0.1474644,
			'u': 0.0081126,
			'v': 0.4041012,
			'w': 0.0749502,
			'x': 0.1335433,
			'y': 0.0081126,
			'z': 0.2924244
		}, {
			' ': 0.8859773,
			'a': 0.3575167,
			'b': 0.1579149,
			'c': 0.9862172,
			'd': 0.1896906,
			'e': 0.8859773,
			'f': 0.2920109,
			'g': 0.6552662,
			'h': 0.7217436,
			'i': 0.4318291,
			'j': 0.7437385,
			'k': 0.6892378,
			'l': 0.2382954,
			'm': 1.0000000,
			'n': 0.4485122,
			'o': 0.8859773,
			'p': 0.1697505,
			'q': 0.5388942,
			'r': 0.2901641,
			's': 0.3404002,
			't': 0.5369747,
			'u': 0.4318291,
			'v': 0.2459939,
			'w': 0.8859773,
			'x': 0.7970067,
			'y': 0.4318291,
			'z': 0.0000000
		}
	];
	const y = new Float32Array(w*7);
	let l = x.length;
	if(l === w){ /* exact width */
		for(let k = 6; k >= 0; k--){
			const i = w*k;
			y[i] = injectivePhones[k][x[0]];
			for(let j = l-1; j > 0; j--){
				y[i+j] = phones[k][x[j]];
			}
		}
	} else if(l > w){ /* downsample with largest triangle three buckets (LTTB; https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) */
		for(let k = 6; k >= 0; k--){
			let d = [];
			d[0] = {
				x: 1,
				y: injectivePhones[k][x[0]]
			};
			for(let j = l-1; j > 0; j--){
				d[j] = {
					x: j+1,
					y: phones[k][x[j]]
				}
			}
			const o = LTTB(d, w);
			const i = w*k;
			for(let j = o.length-1; j >= 0; j--){
				y[i+j] = o[j].y;
			}
		}
	} else { /* upsample with linear interpolation */
		const d = l/w;
		for(let k = 6; k >= 0; k--){
			const i = w*k;
			for(let j = w-1; j >= 0; j--){
				const jx = j*d;
				const ji = Math.trunc(jx);
				const jn = ji+1;
				let s0;
				if(ji === 0){
					s0 = injectivePhones[k][x[0]];
				} else {
					s0 = phones[k][x[ji]];
				}
				let s1;
				if(l === 1){
					s1 = s0;
				} else if(jn > (l-1)){
					s1 = phones[k][x[l-1]];
				} else {
					s1 = phones[k][x[jn]];
				}
				y[i+j] = s0+((jx-ji)*(s1-s0));
			}
		}
	}
	return(y);
}
let i = null;
const pseudosyllables = [
	[new RegExp('..a..'), new RegExp('..b..'), new RegExp('..c..'), new RegExp('..d..'), new RegExp('..e$'), new RegExp('..e..'), new RegExp('..g..'), new RegExp('..h..'), new RegExp('..i..'), new RegExp('..k..'), new RegExp('..l..'), new RegExp('..m..'), new RegExp('..n..'), new RegExp('..o..'), new RegExp('..p..'), new RegExp('..r..'), new RegExp('..s$'), new RegExp('..s..'), new RegExp('..t..'), new RegExp('..u..'), new RegExp('.i.$'), new RegExp('.r..'), new RegExp('.s$'), new RegExp('.u.$'), new RegExp('^.e'), new RegExp('^.e.'), new RegExp('^.o'), new RegExp('^.o.'), new RegExp('i.$'), new RegExp('s$'), new RegExp('u.$')],
	[new RegExp('..i$'), new RegExp('.a...'), new RegExp('.b...'), new RegExp('.c...'), new RegExp('.d...'), new RegExp('.e$'), new RegExp('.e.$'), new RegExp('.e...'), new RegExp('.g...'), new RegExp('.h...'), new RegExp('.i$'), new RegExp('.i...'), new RegExp('.k...'), new RegExp('.l...'), new RegExp('.m...'), new RegExp('.n...'), new RegExp('.o...'), new RegExp('.p...'), new RegExp('.r...'), new RegExp('.s...'), new RegExp('.t...'), new RegExp('.u...'), new RegExp('.y...'), new RegExp('^..r'), new RegExp('^n..'), new RegExp('^p.'), new RegExp('^p..'), new RegExp('e$'), new RegExp('e.$'), new RegExp('e..$'), new RegExp('i$')],
	[new RegExp('...a.'), new RegExp('...b.'), new RegExp('...c.'), new RegExp('...d.'), new RegExp('...e.'), new RegExp('...g.'), new RegExp('...h.'), new RegExp('...i.'), new RegExp('...k.'), new RegExp('...l.'), new RegExp('...m.'), new RegExp('...n.'), new RegExp('...o.'), new RegExp('...p.'), new RegExp('...r.'), new RegExp('...s.'), new RegExp('...t.'), new RegExp('...u.'), new RegExp('...v.'), new RegExp('...y.'), new RegExp('...z.'), new RegExp('..n.'), new RegExp('^..e'), new RegExp('^.i'), new RegExp('^.i.'), new RegExp('^.r'), new RegExp('^n.'), new RegExp('^p'), new RegExp('^s..'), new RegExp('i..$'), new RegExp('n..$')],
	[new RegExp('..an.'), new RegExp('..en.'), new RegExp('..er.'), new RegExp('..st.'), new RegExp('..te.'), new RegExp('..v..'), new RegExp('..y..'), new RegExp('..z..'), new RegExp('.a..'), new RegExp('.an..'), new RegExp('.ar..'), new RegExp('.c..'), new RegExp('.d..'), new RegExp('.e..'), new RegExp('.en..'), new RegExp('.er..'), new RegExp('.g..'), new RegExp('.h..'), new RegExp('.i..'), new RegExp('.l..'), new RegExp('.m..'), new RegExp('.n..'), new RegExp('.o..'), new RegExp('.p..'), new RegExp('.ri..'), new RegExp('.ro..'), new RegExp('.s..'), new RegExp('.t..'), new RegExp('.u..'), new RegExp('^n'), new RegExp('^s.')],
	[new RegExp('..a.'), new RegExp('..b.'), new RegExp('..c.'), new RegExp('..d.'), new RegExp('..e.'), new RegExp('..g.'), new RegExp('..h.'), new RegExp('..i.'), new RegExp('..k.'), new RegExp('..l.'), new RegExp('..m.'), new RegExp('..o.'), new RegExp('..p.'), new RegExp('..r.'), new RegExp('..s.'), new RegExp('..t.'), new RegExp('..u.'), new RegExp('..y.'), new RegExp('.a.i.'), new RegExp('.an.'), new RegExp('.en.'), new RegExp('.n.'), new RegExp('.o.'), new RegExp('.o.a.'), new RegExp('.r.'), new RegExp('.ra..'), new RegExp('.v...'), new RegExp('.z...'), new RegExp('^.a'), new RegExp('^.a.'), new RegExp('^s')],
	[new RegExp('..ri.'), new RegExp('.a.'), new RegExp('.al.'), new RegExp('.ar.'), new RegExp('.b..'), new RegExp('.c.'), new RegExp('.d.'), new RegExp('.e.'), new RegExp('.er.'), new RegExp('.g.'), new RegExp('.h.'), new RegExp('.i.'), new RegExp('.in.'), new RegExp('.k.'), new RegExp('.k..'), new RegExp('.l.'), new RegExp('.m.'), new RegExp('.ni.'), new RegExp('.p.'), new RegExp('.ra.'), new RegExp('.ri.'), new RegExp('.ro.'), new RegExp('.s.'), new RegExp('.st.'), new RegExp('.t.'), new RegExp('.te.'), new RegExp('.u.'), new RegExp('.v..'), new RegExp('.y.'), new RegExp('.y..'), new RegExp('.z..')],
	[new RegExp('..a$'), new RegExp('..at.'), new RegExp('..in.'), new RegExp('..li.'), new RegExp('..m$'), new RegExp('..ni.'), new RegExp('..ra.'), new RegExp('..si.'), new RegExp('..v.'), new RegExp('..z.'), new RegExp('.a$'), new RegExp('.a.e.'), new RegExp('.at.'), new RegExp('.b.'), new RegExp('.ch.'), new RegExp('.e.s.'), new RegExp('.ic.'), new RegExp('.la.'), new RegExp('.li.'), new RegExp('.m$'), new RegExp('.n.$'), new RegExp('.st..'), new RegExp('.us$'), new RegExp('.v.'), new RegExp('.z.'), new RegExp('^.r.'), new RegExp('a$'), new RegExp('m$'), new RegExp('n.$'), new RegExp('s..$'), new RegExp('us$')],
	[new RegExp('..ch.'), new RegExp('..ic.'), new RegExp('..or.'), new RegExp('..ro.'), new RegExp('.al..'), new RegExp('.at..'), new RegExp('.ch..'), new RegExp('.e.a.'), new RegExp('.e.e.'), new RegExp('.e.i.'), new RegExp('.e.t.'), new RegExp('.ie.'), new RegExp('.ie..'), new RegExp('.in..'), new RegExp('.is$'), new RegExp('.la..'), new RegExp('.n.e.'), new RegExp('.n.i.'), new RegExp('.o.e.'), new RegExp('.o.i.'), new RegExp('.on.'), new RegExp('.or.'), new RegExp('.re.'), new RegExp('.re..'), new RegExp('.te..'), new RegExp('^..s'), new RegExp('^.u.'), new RegExp('^c..'), new RegExp('a..$'), new RegExp('is$'), new RegExp('t..$')],
	[new RegExp('..al.'), new RegExp('..ar.'), new RegExp('..el.'), new RegExp('..on.'), new RegExp('..ti.'), new RegExp('.a.a.'), new RegExp('.a.o.'), new RegExp('.el.'), new RegExp('.el..'), new RegExp('.es.'), new RegExp('.i.a.'), new RegExp('.i.e.'), new RegExp('.i.o.'), new RegExp('.li..'), new RegExp('.m.$'), new RegExp('.ni..'), new RegExp('.ol.'), new RegExp('.on..'), new RegExp('.or..'), new RegExp('.os.'), new RegExp('.os..'), new RegExp('.s.e.'), new RegExp('.si.'), new RegExp('.ti.'), new RegExp('.ti..'), new RegExp('^..n'), new RegExp('^.u'), new RegExp('^c.'), new RegExp('^m..'), new RegExp('m.$'), new RegExp('t.$')],
	[new RegExp('..de.'), new RegExp('..f..'), new RegExp('..j..'), new RegExp('..la.'), new RegExp('..le.'), new RegExp('..ne.'), new RegExp('..ns.'), new RegExp('..re.'), new RegExp('..w..'), new RegExp('.ac.'), new RegExp('.de.'), new RegExp('.f..'), new RegExp('.ia.'), new RegExp('.ic..'), new RegExp('.is.'), new RegExp('.le.'), new RegExp('.lo.'), new RegExp('.ne.'), new RegExp('.ne..'), new RegExp('.ns.'), new RegExp('.ta.'), new RegExp('^..a'), new RegExp('^..l'), new RegExp('^..t'), new RegExp('^a.'), new RegExp('^a..'), new RegExp('^c'), new RegExp('^m.'), new RegExp('l..$'), new RegExp('o..$'), new RegExp('r..$')],
	[new RegExp('..f.'), new RegExp('..n$'), new RegExp('..w.'), new RegExp('.a.$'), new RegExp('.a.t.'), new RegExp('.e.o.'), new RegExp('.f.'), new RegExp('.f...'), new RegExp('.i.i.'), new RegExp('.i.n.'), new RegExp('.j...'), new RegExp('.l.$'), new RegExp('.le..'), new RegExp('.lo..'), new RegExp('.n$'), new RegExp('.ns..'), new RegExp('.o.o.'), new RegExp('.r.e.'), new RegExp('.r.n.'), new RegExp('.t.$'), new RegExp('.ta..'), new RegExp('.to..'), new RegExp('.w.'), new RegExp('.w...'), new RegExp('^..i'), new RegExp('^a'), new RegExp('^m'), new RegExp('^ne.'), new RegExp('a.$'), new RegExp('l.$'), new RegExp('n$')],
	[new RegExp('...f.'), new RegExp('...j.'), new RegExp('...w.'), new RegExp('..ac.'), new RegExp('..ia.'), new RegExp('..ie.'), new RegExp('..is.'), new RegExp('..ll.'), new RegExp('..lo.'), new RegExp('..na.'), new RegExp('..no.'), new RegExp('..ol.'), new RegExp('..op.'), new RegExp('..os.'), new RegExp('..ta.'), new RegExp('..to.'), new RegExp('.a.u.'), new RegExp('.ens.'), new RegExp('.es$'), new RegExp('.r.i.'), new RegExp('.s.i.'), new RegExp('.t.r.'), new RegExp('.w..'), new RegExp('^..c'), new RegExp('^..o'), new RegExp('^b..'), new RegExp('^d.'), new RegExp('^d..'), new RegExp('^ne'), new RegExp('^t..'), new RegExp('es$')],
	[new RegExp('..j.'), new RegExp('..nt.'), new RegExp('.ac..'), new RegExp('.as.'), new RegExp('.as..'), new RegExp('.es..'), new RegExp('.et.'), new RegExp('.ia..'), new RegExp('.id.'), new RegExp('.il.'), new RegExp('.il..'), new RegExp('.is..'), new RegExp('.j.'), new RegExp('.ll.'), new RegExp('.na.'), new RegExp('.ng.'), new RegExp('.no.'), new RegExp('.no..'), new RegExp('.nt.'), new RegExp('.nt..'), new RegExp('.ol..'), new RegExp('.op.'), new RegExp('.op..'), new RegExp('.r.a.'), new RegExp('.to.'), new RegExp('.tr..'), new RegExp('^b.'), new RegExp('^d'), new RegExp('^t.'), new RegExp('d..$'), new RegExp('r.$')],
	[new RegExp('..as.'), new RegExp('..ci.'), new RegExp('..id.'), new RegExp('..ng.'), new RegExp('..se.'), new RegExp('..tr.'), new RegExp('.am.'), new RegExp('.c.$'), new RegExp('.e.l.'), new RegExp('.e.n.'), new RegExp('.id..'), new RegExp('.j..'), new RegExp('.l.n.'), new RegExp('.nd.'), new RegExp('.ng..'), new RegExp('.o.$'), new RegExp('.o.t.'), new RegExp('.se.'), new RegExp('.se..'), new RegExp('.tr.'), new RegExp('.um$'), new RegExp('^..p'), new RegExp('^b'), new RegExp('^r.'), new RegExp('^r..'), new RegExp('^t'), new RegExp('c.$'), new RegExp('o.$'), new RegExp('s.s$'), new RegExp('si.$'), new RegExp('um$')],
	[new RegExp('..es.'), new RegExp('..ge.'), new RegExp('..il.'), new RegExp('..nd.'), new RegExp('..ov.'), new RegExp('.em.'), new RegExp('.et..'), new RegExp('.ha.'), new RegExp('.ha..'), new RegExp('.i.t.'), new RegExp('.it.'), new RegExp('.ll..'), new RegExp('.ma..'), new RegExp('.na..'), new RegExp('.nd..'), new RegExp('.oc.'), new RegExp('.oc..'), new RegExp('.om.'), new RegExp('.ov.'), new RegExp('.r.$'), new RegExp('.r.c.'), new RegExp('.ru.'), new RegExp('.s.a.'), new RegExp('.t.n.'), new RegExp('.ul.'), new RegExp('^..m'), new RegExp('^.l.'), new RegExp('^l.'), new RegExp('^l..'), new RegExp('^r'), new RegExp('a.a$')],
	[new RegExp('..do.'), new RegExp('..et.'), new RegExp('..oc.'), new RegExp('..ow.'), new RegExp('..sc.'), new RegExp('.am..'), new RegExp('.ci.'), new RegExp('.di.'), new RegExp('.e.r.'), new RegExp('.ge.'), new RegExp('.it..'), new RegExp('.n.a.'), new RegExp('.n.s.'), new RegExp('.om..'), new RegExp('.ot.'), new RegExp('.ov..'), new RegExp('.ow.'), new RegExp('.r.s.'), new RegExp('.sc.'), new RegExp('.si..'), new RegExp('.u.a.'), new RegExp('.va..'), new RegExp('^.ie'), new RegExp('^.l'), new RegExp('^e.'), new RegExp('^e..'), new RegExp('^h.'), new RegExp('^h..'), new RegExp('^k.'), new RegExp('^k..'), new RegExp('^l')],
	[new RegExp('..am.'), new RegExp('..di.'), new RegExp('..ha.'), new RegExp('..it.'), new RegExp('..ma.'), new RegExp('..va.'), new RegExp('.a.s.'), new RegExp('.de..'), new RegExp('.i.l.'), new RegExp('.i.u.'), new RegExp('.ia$'), new RegExp('.io.'), new RegExp('.ma.'), new RegExp('.ot..'), new RegExp('.s.$'), new RegExp('.s.o.'), new RegExp('.s.r.'), new RegExp('.tu.'), new RegExp('.ul..'), new RegExp('.ur.'), new RegExp('.va.'), new RegExp('^.n.'), new RegExp('^e'), new RegExp('^h'), new RegExp('^k'), new RegExp('^ni.'), new RegExp('c..$'), new RegExp('ia$'), new RegExp('o$'), new RegExp('s.$'), new RegExp('sis$')],
	[new RegExp('..io.'), new RegExp('..me.'), new RegExp('..o$'), new RegExp('..ru.'), new RegExp('..tu.'), new RegExp('.co.'), new RegExp('.co..'), new RegExp('.do.'), new RegExp('.do..'), new RegExp('.en$'), new RegExp('.ep.'), new RegExp('.ep..'), new RegExp('.io..'), new RegExp('.me.'), new RegExp('.na$'), new RegExp('.o$'), new RegExp('.od.'), new RegExp('.od..'), new RegExp('.r.t.'), new RegExp('.sc..'), new RegExp('.t.l.'), new RegExp('.u.i.'), new RegExp('^..u'), new RegExp('^.n'), new RegExp('^g..'), new RegExp('^ni'), new RegExp('^o.'), new RegExp('^o..'), new RegExp('an.$'), new RegExp('en$'), new RegExp('na$')],
	[new RegExp('..co.'), new RegExp('..em.'), new RegExp('..mi.'), new RegExp('..om.'), new RegExp('..ul.'), new RegExp('.ca.'), new RegExp('.ci..'), new RegExp('.di..'), new RegExp('.e.d.'), new RegExp('.ei.'), new RegExp('.he.'), new RegExp('.hi.'), new RegExp('.l.e.'), new RegExp('.l.s.'), new RegExp('.mi.'), new RegExp('.n.t.'), new RegExp('.nsi.'), new RegExp('.ow..'), new RegExp('.ph.'), new RegExp('.t.a.'), new RegExp('.t.e.'), new RegExp('.un.'), new RegExp('.ur..'), new RegExp('^..b'), new RegExp('^..d'), new RegExp('^.y.'), new RegExp('^f.'), new RegExp('^f..'), new RegExp('^g.'), new RegExp('^n.e'), new RegExp('^o')],
	[new RegExp('..ca.'), new RegExp('..ot.'), new RegExp('..ph.'), new RegExp('..ss.'), new RegExp('.ad.'), new RegExp('.c.e.'), new RegExp('.c.l.'), new RegExp('.ce.'), new RegExp('.ec.'), new RegExp('.ge..'), new RegExp('.i.r.'), new RegExp('.l.i.'), new RegExp('.la$'), new RegExp('.me..'), new RegExp('.n.o.'), new RegExp('.o.u.'), new RegExp('.ph..'), new RegExp('.r.o.'), new RegExp('.ss.'), new RegExp('.t.i.'), new RegExp('.t.o.'), new RegExp('.u.e.'), new RegExp('.wa.'), new RegExp('^.ar'), new RegExp('^.h'), new RegExp('^.h.'), new RegExp('^.y'), new RegExp('^f'), new RegExp('^g'), new RegExp('^nie'), new RegExp('la$')],
	[new RegExp('..ce.'), new RegExp('..da.'), new RegExp('..he.'), new RegExp('..ko.'), new RegExp('..r$'), new RegExp('..wa.'), new RegExp('.a.d.'), new RegExp('.a.r.'), new RegExp('.ca..'), new RegExp('.ce..'), new RegExp('.da.'), new RegExp('.em..'), new RegExp('.ho.'), new RegExp('.ho..'), new RegExp('.im.'), new RegExp('.ko.'), new RegExp('.ko..'), new RegExp('.l.t.'), new RegExp('.lu.'), new RegExp('.m.n.'), new RegExp('.n.r.'), new RegExp('.nu.'), new RegExp('.o.h.'), new RegExp('.o.s.'), new RegExp('.pi.'), new RegExp('.po.'), new RegExp('.po..'), new RegExp('.r$'), new RegExp('.un..'), new RegExp('^..g'), new RegExp('r$')],
	[new RegExp('..ei.'), new RegExp('..hi.'), new RegExp('..ho.'), new RegExp('..lu.'), new RegExp('..mo.'), new RegExp('..nu.'), new RegExp('..od.'), new RegExp('..po.'), new RegExp('..th.'), new RegExp('.a.n.'), new RegExp('.ae$'), new RegExp('.c.a.'), new RegExp('.c.n.'), new RegExp('.ec..'), new RegExp('.ed.'), new RegExp('.ei..'), new RegExp('.ell.'), new RegExp('.eu.'), new RegExp('.hi..'), new RegExp('.l.a.'), new RegExp('.mi..'), new RegExp('.mo.'), new RegExp('.pe.'), new RegExp('.ss..'), new RegExp('.th.'), new RegExp('.us.'), new RegExp('.us..'), new RegExp('.wa..'), new RegExp('^.er'), new RegExp('ae$'), new RegExp('t.s$')],
	[new RegExp('..pe.'), new RegExp('..t$'), new RegExp('..un.'), new RegExp('..ur.'), new RegExp('.ad..'), new RegExp('.av.'), new RegExp('.be.'), new RegExp('.c.o.'), new RegExp('.e.u.'), new RegExp('.he..'), new RegExp('.i.s.'), new RegExp('.n.c.'), new RegExp('.o.d.'), new RegExp('.pa.'), new RegExp('.pi..'), new RegExp('.s.u.'), new RegExp('.t$'), new RegExp('.ta$'), new RegExp('.ter.'), new RegExp('.th..'), new RegExp('.u.o.'), new RegExp('.ve.'), new RegExp('^v..'), new RegExp('de.$'), new RegExp('i.a$'), new RegExp('l.s$'), new RegExp('m..$'), new RegExp('t$'), new RegExp('ta$'), new RegExp('te.$'), new RegExp('y..$')],
	[new RegExp('..ad.'), new RegExp('..im.'), new RegExp('..pi.'), new RegExp('..sa.'), new RegExp('..sk.'), new RegExp('..ve.'), new RegExp('..y$'), new RegExp('.a.l.'), new RegExp('.a.y.'), new RegExp('.c.r.'), new RegExp('.ed..'), new RegExp('.g.n.'), new RegExp('.h.l.'), new RegExp('.ig.'), new RegExp('.ig..'), new RegExp('.l.c.'), new RegExp('.n.n.'), new RegExp('.o.r.'), new RegExp('.o.y.'), new RegExp('.p.r.'), new RegExp('.rt.'), new RegExp('.sa.'), new RegExp('.sk.'), new RegExp('.ste.'), new RegExp('.t.c.'), new RegExp('.y$'), new RegExp('^v.'), new RegExp('e.s$'), new RegExp('en.$'), new RegExp('u..$'), new RegExp('y$')],
	[new RegExp('..be.'), new RegExp('..ec.'), new RegExp('..ga.'), new RegExp('..ka.'), new RegExp('..rt.'), new RegExp('..u$'), new RegExp('.ap.'), new RegExp('.ap..'), new RegExp('.av..'), new RegExp('.ba.'), new RegExp('.c.i.'), new RegExp('.eo.'), new RegExp('.ga.'), new RegExp('.i.g.'), new RegExp('.i.h.'), new RegExp('.ka.'), new RegExp('.l.r.'), new RegExp('.mo..'), new RegExp('.pa..'), new RegExp('.ru..'), new RegExp('.sa..'), new RegExp('.so.'), new RegExp('.u$'), new RegExp('.v.n.'), new RegExp('^.s'), new RegExp('^.s.'), new RegExp('^.t.'), new RegExp('^v'), new RegExp('n.s$'), new RegExp('o.a$'), new RegExp('u$')],
	[new RegExp('..av.'), new RegExp('..ba.'), new RegExp('..h$'), new RegExp('..pa.'), new RegExp('.a.h.'), new RegExp('.ab.'), new RegExp('.ani.'), new RegExp('.be..'), new RegExp('.cu.'), new RegExp('.eo..'), new RegExp('.eu..'), new RegExp('.h$'), new RegExp('.i.c.'), new RegExp('.o.l.'), new RegExp('.o.n.'), new RegExp('.pe..'), new RegExp('.pr.'), new RegExp('.pr..'), new RegExp('.r.m.'), new RegExp('.r.p.'), new RegExp('.r.u.'), new RegExp('.s.n.'), new RegExp('.ve..'), new RegExp('.ze.'), new RegExp('^..z'), new RegExp('^.t'), new RegExp('^i.'), new RegExp('^i..'), new RegExp('d.s$'), new RegExp('h$'), new RegExp('l.a$')],
	[new RegExp('..cu.'), new RegExp('..ep.'), new RegExp('..eu.'), new RegExp('..za.'), new RegExp('..ze.'), new RegExp('.ab..'), new RegExp('.ag.'), new RegExp('.ali.'), new RegExp('.d.n.'), new RegExp('.eg.'), new RegExp('.ga..'), new RegExp('.h.n.'), new RegExp('.h.r.'), new RegExp('.if.'), new RegExp('.ka..'), new RegExp('.l.o.'), new RegExp('.p.i.'), new RegExp('.p.o.'), new RegExp('.rt..'), new RegExp('.sk..'), new RegExp('.so..'), new RegExp('.sp.'), new RegExp('.sp..'), new RegExp('.vi.'), new RegExp('.za.'), new RegExp('^..h'), new RegExp('^.c.'), new RegExp('^i'), new RegExp('^pr.'), new RegExp('h..$'), new RegExp('r.s$')],
	[new RegExp('..ig.'), new RegExp('..pr.'), new RegExp('..so.'), new RegExp('..sp.'), new RegExp('..vi.'), new RegExp('.ae.'), new RegExp('.ae..'), new RegExp('.ag..'), new RegExp('.ari.'), new RegExp('.au..'), new RegExp('.ba..'), new RegExp('.ch$'), new RegExp('.if..'), new RegExp('.ir.'), new RegExp('.mi$'), new RegExp('.n.l.'), new RegExp('.n.m.'), new RegExp('.n.u.'), new RegExp('.ost.'), new RegExp('.p.a.'), new RegExp('.p.e.'), new RegExp('.u.t.'), new RegExp('.za..'), new RegExp('.ze..'), new RegExp('^.c'), new RegExp('^pr'), new RegExp('^z..'), new RegExp('ch$'), new RegExp('mi$'), new RegExp('ni.$'), new RegExp('tu.$')],
	[new RegExp('..bi.'), new RegExp('..ed.'), new RegExp('..if.'), new RegExp('..us.'), new RegExp('.a.c.'), new RegExp('.au.'), new RegExp('.ct.'), new RegExp('.da..'), new RegExp('.e.c.'), new RegExp('.ian.'), new RegExp('.ide.'), new RegExp('.ip.'), new RegExp('.ip..'), new RegExp('.ir..'), new RegExp('.l.u.'), new RegExp('.m.r.'), new RegExp('.ob.'), new RegExp('.ova.'), new RegExp('.r.l.'), new RegExp('.rn.'), new RegExp('.s.h.'), new RegExp('.ut.'), new RegExp('^.al'), new RegExp('^.an'), new RegExp('^.p.'), new RegExp('^ma.'), new RegExp('^pa.'), new RegExp('^po.'), new RegExp('^z.'), new RegExp('er.$'), new RegExp('g..$')],
	[new RegExp('..ab.'), new RegExp('..ae.'), new RegExp('..rn.'), new RegExp('..rs.'), new RegExp('.bi.'), new RegExp('.bi..'), new RegExp('.d.r.'), new RegExp('.ea.'), new RegExp('.ej.'), new RegExp('.eri.'), new RegExp('.ke.'), new RegExp('.nc.'), new RegExp('.nc..'), new RegExp('.ob..'), new RegExp('.oi.'), new RegExp('.r.d.'), new RegExp('.rs.'), new RegExp('.ut..'), new RegExp('.vi..'), new RegExp('.y.$'), new RegExp('.yc.'), new RegExp('.ys.'), new RegExp('^.or'), new RegExp('^.p'), new RegExp('^ma'), new RegExp('^pa'), new RegExp('^po'), new RegExp('^z'), new RegExp('at.$'), new RegExp('nu.$'), new RegExp('y.$')],
	[new RegExp('..ap.'), new RegExp('..ct.'), new RegExp('..eg.'), new RegExp('..ej.'), new RegExp('..ke.'), new RegExp('..rm.'), new RegExp('.er$'), new RegExp('.fo.'), new RegExp('.gi.'), new RegExp('.im..'), new RegExp('.ing.'), new RegExp('.l.b.'), new RegExp('.og.'), new RegExp('.oi..'), new RegExp('.p.l.'), new RegExp('.p.n.'), new RegExp('.ra$'), new RegExp('.rm.'), new RegExp('.rs..'), new RegExp('.tu..'), new RegExp('.ud.'), new RegExp('.ud..'), new RegExp('.ys..'), new RegExp('^.on'), new RegExp('^.ra'), new RegExp('^w.'), new RegExp('^w..'), new RegExp('ana$'), new RegExp('er$'), new RegExp('n.e$'), new RegExp('ra$')],
	[new RegExp('..ag.'), new RegExp('..fo.'), new RegExp('..oi.'), new RegExp('.ct..'), new RegExp('.eg..'), new RegExp('.ej..'), new RegExp('.ek.'), new RegExp('.ent.'), new RegExp('.f.r.'), new RegExp('.g.a.'), new RegExp('.h.e.'), new RegExp('.i.p.'), new RegExp('.iu.'), new RegExp('.lu..'), new RegExp('.m.t.'), new RegExp('.n.h.'), new RegExp('.nn.'), new RegExp('.og..'), new RegExp('.rn..'), new RegExp('.s.m.'), new RegExp('.t.s.'), new RegExp('.uc.'), new RegExp('^..k'), new RegExp('^.es'), new RegExp('^p.e'), new RegExp('^p.r'), new RegExp('^w'), new RegExp('des$'), new RegExp('e.e$'), new RegExp('ll.$'), new RegExp('ri.$')],
	[new RegExp('..ea.'), new RegExp('..gi.'), new RegExp('..ip.'), new RegExp('..iu.'), new RegExp('..nc.'), new RegExp('..tt.'), new RegExp('..ud.'), new RegExp('..ut.'), new RegExp('..yc.'), new RegExp('.and.'), new RegExp('.b.r.'), new RegExp('.e.h.'), new RegExp('.e.m.'), new RegExp('.ere.'), new RegExp('.fo..'), new RegExp('.ne$'), new RegExp('.rm..'), new RegExp('.rz.'), new RegExp('.rz..'), new RegExp('.s.l.'), new RegExp('.tt.'), new RegExp('.uc..'), new RegExp('.van.'), new RegExp('.y.o.'), new RegExp('^..v'), new RegExp('^.en'), new RegExp('^u..'), new RegExp('a.i$'), new RegExp('ic.$'), new RegExp('li.$'), new RegExp('ne$')],
	[new RegExp('..ir.'), new RegExp('..nn.'), new RegExp('..ob.'), new RegExp('..og.'), new RegExp('..ys.'), new RegExp('.ak.'), new RegExp('.ane.'), new RegExp('.ara.'), new RegExp('.br.'), new RegExp('.c.t.'), new RegExp('.d.$'), new RegExp('.ea..'), new RegExp('.ek..'), new RegExp('.ez.'), new RegExp('.hr.'), new RegExp('.i.k.'), new RegExp('.ist.'), new RegExp('.o.p.'), new RegExp('.owa.'), new RegExp('.ran.'), new RegExp('.ry.'), new RegExp('.sch.'), new RegExp('.str.'), new RegExp('.t.t.'), new RegExp('.ub.'), new RegExp('.y.a.'), new RegExp('.ym.'), new RegExp('^ca.'), new RegExp('^u.'), new RegExp('d.$'), new RegExp('ru.$')],
	[new RegExp('..au.'), new RegExp('.a.g.'), new RegExp('.ant.'), new RegExp('.atu.'), new RegExp('.br..'), new RegExp('.d.l.'), new RegExp('.e.k.'), new RegExp('.era.'), new RegExp('.ero.'), new RegExp('.gi..'), new RegExp('.h.$'), new RegExp('.i.m.'), new RegExp('.ii$'), new RegExp('.k.e.'), new RegExp('.ki.'), new RegExp('.l.g.'), new RegExp('.ma$'), new RegExp('.nn..'), new RegExp('.oz.'), new RegExp('.oz..'), new RegExp('.ry..'), new RegExp('.tt..'), new RegExp('.ub..'), new RegExp('^ca'), new RegExp('^co.'), new RegExp('^u'), new RegExp('e.a$'), new RegExp('h.$'), new RegExp('ii$'), new RegExp('in.$'), new RegExp('ma$')],
	[new RegExp('..cz.'), new RegExp('.ak..'), new RegExp('.bo.'), new RegExp('.cz.'), new RegExp('.d.a.'), new RegExp('.ez..'), new RegExp('.g.$'), new RegExp('.g.r.'), new RegExp('.hr..'), new RegExp('.hy.'), new RegExp('.i.d.'), new RegExp('.ke..'), new RegExp('.m.e.'), new RegExp('.m.l.'), new RegExp('.o.c.'), new RegExp('.o.m.'), new RegExp('.oid.'), new RegExp('.su.'), new RegExp('.t.m.'), new RegExp('.v.r.'), new RegExp('.z.n.'), new RegExp('^..y'), new RegExp('^.ro'), new RegExp('^co'), new RegExp('^de.'), new RegExp('^st.'), new RegExp('g.$'), new RegExp('k..$'), new RegExp('lla$'), new RegExp('ne.$'), new RegExp('p..$')],
	[new RegExp('..br.'), new RegExp('..eo.'), new RegExp('..ki.'), new RegExp('.a.k.'), new RegExp('.a.m.'), new RegExp('.a.p.'), new RegExp('.c.u.'), new RegExp('.dr.'), new RegExp('.em$'), new RegExp('.eni.'), new RegExp('.ev.'), new RegExp('.gr.'), new RegExp('.gr..'), new RegExp('.k.n.'), new RegExp('.l.p.'), new RegExp('.nge.'), new RegExp('.ny.'), new RegExp('.oni.'), new RegExp('.te$'), new RegExp('.yl.'), new RegExp('^.m'), new RegExp('^.m.'), new RegExp('^.ol'), new RegExp('^.ri'), new RegExp('^de'), new RegExp('^st'), new RegExp('em$'), new RegExp('lu.$'), new RegExp('m.s$'), new RegExp('r.a$'), new RegExp('te$')],
	[new RegExp('..bo.'), new RegExp('..ek.'), new RegExp('..gr.'), new RegExp('..ny.'), new RegExp('..su.'), new RegExp('..uc.'), new RegExp('..ym.'), new RegExp('.ai.'), new RegExp('.bo..'), new RegExp('.cz..'), new RegExp('.eb.'), new RegExp('.ev..'), new RegExp('.ik.'), new RegExp('.iz.'), new RegExp('.mp.'), new RegExp('.mp..'), new RegExp('.ns$'), new RegExp('.ou.'), new RegExp('.pl.'), new RegExp('.pl..'), new RegExp('.r.g.'), new RegExp('.rd.'), new RegExp('.rr.'), new RegExp('.u.n.'), new RegExp('.um.'), new RegExp('^.el'), new RegExp('^.in'), new RegExp('iu.$'), new RegExp('n.m$'), new RegExp('ns$'), new RegExp('tus$')],
	[new RegExp('..ck.'), new RegExp('..dr.'), new RegExp('..gs.'), new RegExp('..rd.'), new RegExp('.b.l.'), new RegExp('.ck.'), new RegExp('.cu..'), new RegExp('.d.i.'), new RegExp('.eb..'), new RegExp('.est.'), new RegExp('.g.e.'), new RegExp('.hu.'), new RegExp('.hy..'), new RegExp('.ien.'), new RegExp('.iv.'), new RegExp('.k.$'), new RegExp('.l.m.'), new RegExp('.lan.'), new RegExp('.r.h.'), new RegExp('.r.v.'), new RegExp('.ty.'), new RegExp('.um..'), new RegExp('.w.n.'), new RegExp('.yl..'), new RegExp('.zo.'), new RegExp('^.ep'), new RegExp('^.re'), new RegExp('a.e$'), new RegExp('ata$'), new RegExp('k.$'), new RegExp('n.a$')],
	[new RegExp('..go.'), new RegExp('..hr.'), new RegExp('..iz.'), new RegExp('..pl.'), new RegExp('..ty.'), new RegExp('..zo.'), new RegExp('.ast.'), new RegExp('.ati.'), new RegExp('.che.'), new RegExp('.dr..'), new RegExp('.e.b.'), new RegExp('.e.p.'), new RegExp('.go.'), new RegExp('.gs.'), new RegExp('.gs..'), new RegExp('.ik..'), new RegExp('.ja.'), new RegExp('.lat.'), new RegExp('.ly.'), new RegExp('.oli.'), new RegExp('.ou..'), new RegExp('.pt.'), new RegExp('.rd..'), new RegExp('.rr..'), new RegExp('.sti.'), new RegExp('.ten.'), new RegExp('.ty..'), new RegExp('.u.g.'), new RegExp('.u.u.'), new RegExp('.wi.'), new RegExp('.zo..')],
	[new RegExp('..hu.'), new RegExp('..ik.'), new RegExp('..ja.'), new RegExp('..pt.'), new RegExp('..rr.'), new RegExp('..ry.'), new RegExp('..yl.'), new RegExp('.d.e.'), new RegExp('.d.o.'), new RegExp('.e.g.'), new RegExp('.go..'), new RegExp('.ich.'), new RegExp('.iz..'), new RegExp('.js.'), new RegExp('.l.d.'), new RegExp('.mu.'), new RegExp('.nos.'), new RegExp('.rc.'), new RegExp('.rg.'), new RegExp('.rg..'), new RegExp('.s.c.'), new RegExp('.se$'), new RegExp('.sm.'), new RegExp('.t.p.'), new RegExp('^.as'), new RegExp('^an.'), new RegExp('^re'), new RegExp('^re.'), new RegExp('^tr.'), new RegExp('b..$'), new RegExp('se$')],
	[new RegExp('..fe.'), new RegExp('..js.'), new RegExp('..sm.'), new RegExp('..wi.'), new RegExp('.ach.'), new RegExp('.anu.'), new RegExp('.as$'), new RegExp('.ava.'), new RegExp('.e.y.'), new RegExp('.fe.'), new RegExp('.iv..'), new RegExp('.ja..'), new RegExp('.lt.'), new RegExp('.ly..'), new RegExp('.pt..'), new RegExp('.r.b.'), new RegExp('.r.r.'), new RegExp('.r.z.'), new RegExp('.ren.'), new RegExp('.sta.'), new RegExp('.t.u.'), new RegExp('.tra.'), new RegExp('.wi..'), new RegExp('.yc..'), new RegExp('^.la'), new RegExp('^an'), new RegExp('^ch.'), new RegExp('^tr'), new RegExp('as$'), new RegExp('e.i$'), new RegExp('re.$')],
	[new RegExp('..ak.'), new RegExp('..hy.'), new RegExp('..ly.'), new RegExp('..mu.'), new RegExp('..rg.'), new RegExp('..uj.'), new RegExp('.aj.'), new RegExp('.h.a.'), new RegExp('.h.i.'), new RegExp('.ib.'), new RegExp('.ki..'), new RegExp('.l.v.'), new RegExp('.lin.'), new RegExp('.nic.'), new RegExp('.rc..'), new RegExp('.ric.'), new RegExp('.tri.'), new RegExp('.u.c.'), new RegExp('.u.s.'), new RegExp('.uj.'), new RegExp('.w.l.'), new RegExp('.y.i.'), new RegExp('^ba.'), new RegExp('^c.r'), new RegExp('^ch'), new RegExp('^la.'), new RegExp('^me.'), new RegExp('em.$'), new RegExp('i.m$'), new RegExp('nus$'), new RegExp('v..$')],
	[new RegExp('..gu.'), new RegExp('..iv.'), new RegExp('..rz.'), new RegExp('..zi.'), new RegExp('.ano.'), new RegExp('.chi.'), new RegExp('.d.s.'), new RegExp('.ejs.'), new RegExp('.gen.'), new RegExp('.gu.'), new RegExp('.lt..'), new RegExp('.m.s.'), new RegExp('.nde.'), new RegExp('.nu..'), new RegExp('.oe.'), new RegExp('.oph.'), new RegExp('.r.k.'), new RegExp('.rin.'), new RegExp('.s.t.'), new RegExp('.ts.'), new RegExp('.ts..'), new RegExp('.ue.'), new RegExp('.yp.'), new RegExp('.yp..'), new RegExp('.zi.'), new RegExp('^..f'), new RegExp('^..j'), new RegExp('^ba'), new RegExp('^la'), new RegExp('^me'), new RegExp('i.e$')],
	[new RegExp('..eb.'), new RegExp('..lt.'), new RegExp('..ts.'), new RegExp('..um.'), new RegExp('.b.e.'), new RegExp('.ck..'), new RegExp('.cr.'), new RegExp('.cr..'), new RegExp('.d.c.'), new RegExp('.du.'), new RegExp('.e.z.'), new RegExp('.ene.'), new RegExp('.fi.'), new RegExp('.h.o.'), new RegExp('.ib..'), new RegExp('.ie$'), new RegExp('.ier.'), new RegExp('.j.i.'), new RegExp('.mb.'), new RegExp('.n.p.'), new RegExp('.pu.'), new RegExp('.u.r.'), new RegExp('.v.l.'), new RegExp('.wan.'), new RegExp('.y.e.'), new RegExp('^in.'), new RegExp('^su.'), new RegExp('i.s$'), new RegExp('ie$'), new RegExp('im.$'), new RegExp('t.m$')],
	[new RegExp('..du.'), new RegExp('..fi.'), new RegExp('..g$'), new RegExp('..mp.'), new RegExp('..pu.'), new RegExp('..rc.'), new RegExp('.a.b.'), new RegExp('.ala.'), new RegExp('.c.s.'), new RegExp('.g$'), new RegExp('.ico.'), new RegExp('.je.'), new RegExp('.js..'), new RegExp('.n.j.'), new RegExp('.ni$'), new RegExp('.nia.'), new RegExp('.nk.'), new RegExp('.o.k.'), new RegExp('.os$'), new RegExp('.ue..'), new RegExp('^.ac'), new RegExp('^.at'), new RegExp('^.b.'), new RegExp('^.d.'), new RegExp('^.et'), new RegExp('^in'), new RegExp('^pe.'), new RegExp('^su'), new RegExp('g$'), new RegExp('ni$'), new RegExp('os$')],
	[new RegExp('..nk.'), new RegExp('.b.a.'), new RegExp('.b.i.'), new RegExp('.b.n.'), new RegExp('.cha.'), new RegExp('.fe..'), new RegExp('.fi..'), new RegExp('.g.l.'), new RegExp('.i.z.'), new RegExp('.ini.'), new RegExp('.k.a.'), new RegExp('.lli.'), new RegExp('.mb..'), new RegExp('.nen.'), new RegExp('.ny..'), new RegExp('.oe..'), new RegExp('.ok.'), new RegExp('.rat.'), new RegExp('.tel.'), new RegExp('.tro.'), new RegExp('.u.l.'), new RegExp('.we.'), new RegExp('.zi..'), new RegExp('^.b'), new RegExp('^.d'), new RegExp('^.ur'), new RegExp('^di.'), new RegExp('^na.'), new RegExp('^pe'), new RegExp('^ps.'), new RegExp('^sa.')],
	[new RegExp('..ai.'), new RegExp('..ou.'), new RegExp('.aj..'), new RegExp('.ato.'), new RegExp('.eh.'), new RegExp('.f.l.'), new RegExp('.g.s.'), new RegExp('.j.c.'), new RegExp('.len.'), new RegExp('.m.a.'), new RegExp('.men.'), new RegExp('.ngs.'), new RegExp('.nte.'), new RegExp('.o.g.'), new RegExp('.rb.'), new RegExp('.tan.'), new RegExp('.tic.'), new RegExp('.ua.'), new RegExp('.uj..'), new RegExp('.v.$'), new RegExp('^di'), new RegExp('^mi.'), new RegExp('^na'), new RegExp('^ps'), new RegExp('^sa'), new RegExp('^se.'), new RegExp('al.$'), new RegExp('ge.$'), new RegExp('i.i$'), new RegExp('v.$'), new RegExp('ym.$')],
	[new RegExp('..we.'), new RegExp('.a.z.'), new RegExp('.ass.'), new RegExp('.ate.'), new RegExp('.bu.'), new RegExp('.ca$'), new RegExp('.g.i.'), new RegExp('.hl.'), new RegExp('.ina.'), new RegExp('.k.r.'), new RegExp('.mm.'), new RegExp('.mu$'), new RegExp('.nk..'), new RegExp('.ok..'), new RegExp('.p.t.'), new RegExp('.rac.'), new RegExp('.rb..'), new RegExp('.ria.'), new RegExp('.rk.'), new RegExp('.ua..'), new RegExp('.yr.'), new RegExp('^.am'), new RegExp('^.ub'), new RegExp('^mi'), new RegExp('^p.o'), new RegExp('^s.r'), new RegExp('^se'), new RegExp('c.s$'), new RegExp('ca$'), new RegExp('cu.$'), new RegExp('mu$')],
	[new RegExp('..aj.'), new RegExp('..bu.'), new RegExp('..cr.'), new RegExp('..je.'), new RegExp('..oz.'), new RegExp('.ai..'), new RegExp('.az.'), new RegExp('.c.m.'), new RegExp('.gu..'), new RegExp('.hl..'), new RegExp('.ida.'), new RegExp('.ili.'), new RegExp('.ill.'), new RegExp('.ion.'), new RegExp('.je..'), new RegExp('.m.c.'), new RegExp('.one.'), new RegExp('.ros.'), new RegExp('.sz.'), new RegExp('.t.v.'), new RegExp('.y.t.'), new RegExp('.zy.'), new RegExp('^al.'), new RegExp('^d.s'), new RegExp('^he.'), new RegExp('^j..'), new RegExp('^sc.'), new RegExp('e.o$'), new RegExp('le.$'), new RegExp('lus$'), new RegExp('ti.$')],
	[new RegExp('..ib.'), new RegExp('..mm.'), new RegExp('..sz.'), new RegExp('..ue.'), new RegExp('.ale.'), new RegExp('.az..'), new RegExp('.b.s.'), new RegExp('.eli.'), new RegExp('.end.'), new RegExp('.icu.'), new RegExp('.kr.'), new RegExp('.n.k.'), new RegExp('.ori.'), new RegExp('.r.f.'), new RegExp('.seu.'), new RegExp('.t.g.'), new RegExp('.ui.'), new RegExp('.ula.'), new RegExp('.up.'), new RegExp('.vo.'), new RegExp('.wal.'), new RegExp('.yr..'), new RegExp('.zy..'), new RegExp('^.se'), new RegExp('^al'), new RegExp('^he'), new RegExp('^j.'), new RegExp('^p.l'), new RegExp('^s.a'), new RegExp('^sc'), new RegExp('j..$')],
	[new RegExp('..l$'), new RegExp('..rk.'), new RegExp('..zy.'), new RegExp('.all.'), new RegExp('.eud.'), new RegExp('.for.'), new RegExp('.g.o.'), new RegExp('.h.s.'), new RegExp('.h.t.'), new RegExp('.ine.'), new RegExp('.ku.'), new RegExp('.l$'), new RegExp('.ls.'), new RegExp('.m.i.'), new RegExp('.och.'), new RegExp('.on$'), new RegExp('.rop.'), new RegExp('.ung.'), new RegExp('.up..'), new RegExp('.y.l.'), new RegExp('^.il'), new RegExp('^be.'), new RegExp('^j'), new RegExp('^par'), new RegExp('^ro.'), new RegExp('h.s$'), new RegExp('l$'), new RegExp('lis$'), new RegExp('on$'), new RegExp('r.m$'), new RegExp('u.a$')],
	[new RegExp('..ez.'), new RegExp('..ls.'), new RegExp('..mb.'), new RegExp('..vo.'), new RegExp('.ace.'), new RegExp('.ang.'), new RegExp('.c.p.'), new RegExp('.c.y.'), new RegExp('.der.'), new RegExp('.ern.'), new RegExp('.ino.'), new RegExp('.jsi.'), new RegExp('.kr..'), new RegExp('.kt.'), new RegExp('.ps.'), new RegExp('.rk..'), new RegExp('.sto.'), new RegExp('.su..'), new RegExp('.sz..'), new RegExp('.ui..'), new RegExp('.ver.'), new RegExp('.yn.'), new RegExp('^be'), new RegExp('^ha.'), new RegExp('^ka.'), new RegExp('^le.'), new RegExp('^ro'), new RegExp('ens$'), new RegExp('ns.$'), new RegExp('o.i$'), new RegExp('z..$')],
	[new RegExp('..ps.'), new RegExp('..rb.'), new RegExp('.den.'), new RegExp('.ea$'), new RegExp('.ef.'), new RegExp('.fa.'), new RegExp('.isc.'), new RegExp('.k.i.'), new RegExp('.k.l.'), new RegExp('.lb.'), new RegExp('.ls..'), new RegExp('.ps..'), new RegExp('.r.y.'), new RegExp('.ti$'), new RegExp('.u.d.'), new RegExp('.udo.'), new RegExp('.v.t.'), new RegExp('.y.n.'), new RegExp('^ha'), new RegExp('^ka'), new RegExp('^ko.'), new RegExp('^le'), new RegExp('^mo.'), new RegExp('^n.p'), new RegExp('^pse'), new RegExp('ci.$'), new RegExp('da.$'), new RegExp('ea$'), new RegExp('ra.$'), new RegExp('st.$'), new RegExp('ti$')],
	[new RegExp('..ev.'), new RegExp('..hl.'), new RegExp('..kt.'), new RegExp('.are.'), new RegExp('.bu..'), new RegExp('.cho.'), new RegExp('.du..'), new RegExp('.ef..'), new RegExp('.eno.'), new RegExp('.ers.'), new RegExp('.lic.'), new RegExp('.mm..'), new RegExp('.q.'), new RegExp('.q..'), new RegExp('.rp.'), new RegExp('.sl.'), new RegExp('.u.h.'), new RegExp('.vo..'), new RegExp('.ym$'), new RegExp('^.ed'), new RegExp('^.eo'), new RegExp('^.is'), new RegExp('^a.t'), new RegExp('^ko'), new RegExp('^m.n'), new RegExp('^mo'), new RegExp('^sp.'), new RegExp('^za.'), new RegExp('ac.$'), new RegExp('on.$'), new RegExp('ym$')],
	[new RegExp('..fa.'), new RegExp('..ku.'), new RegExp('..oe.'), new RegExp('..rp.'), new RegExp('.b.t.'), new RegExp('.by.'), new RegExp('.fa..'), new RegExp('.hu..'), new RegExp('.ku..'), new RegExp('.man.'), new RegExp('.n.v.'), new RegExp('.nti.'), new RegExp('.olo.'), new RegExp('.p.d.'), new RegExp('.qu.'), new RegExp('.ris.'), new RegExp('.sen.'), new RegExp('.sse.'), new RegExp('.we..'), new RegExp('.z.l.'), new RegExp('^.ch'), new RegExp('^.ha'), new RegExp('^a.a'), new RegExp('^br.'), new RegExp('^sp'), new RegExp('^te.'), new RegExp('^za'), new RegExp('c.e$'), new RegExp('e.u$'), new RegExp('nse$'), new RegExp('s.a$')],
	[new RegExp('..by.'), new RegExp('..eh.'), new RegExp('..kr.'), new RegExp('..sl.'), new RegExp('..yp.'), new RegExp('.ah.'), new RegExp('.b.$'), new RegExp('.d.t.'), new RegExp('.ica.'), new RegExp('.ifo.'), new RegExp('.ite.'), new RegExp('.kt..'), new RegExp('.lla.'), new RegExp('.ode.'), new RegExp('.ono.'), new RegExp('.pu..'), new RegExp('.sl..'), new RegExp('.sm..'), new RegExp('.tat.'), new RegExp('.yn..'), new RegExp('.z.a.'), new RegExp('.z.e.'), new RegExp('^.em'), new RegExp('^.ic'), new RegExp('^ar.'), new RegExp('^br'), new RegExp('^do.'), new RegExp('^m.r'), new RegExp('^te'), new RegExp('ia.$'), new RegExp('ie.$')],
	[new RegExp('.eh..'), new RegExp('.ele.'), new RegExp('.ena.'), new RegExp('.epr.'), new RegExp('.ete.'), new RegExp('.ew..'), new RegExp('.idi.'), new RegExp('.l.k.'), new RegExp('.lle.'), new RegExp('.m.o.'), new RegExp('.nej.'), new RegExp('.nie.'), new RegExp('.nth.'), new RegExp('.q...'), new RegExp('.roc.'), new RegExp('.rp..'), new RegExp('.sci.'), new RegExp('.z.r.'), new RegExp('^.k.'), new RegExp('^.om'), new RegExp('^.os'), new RegExp('^.us'), new RegExp('^ar'), new RegExp('^c.n'), new RegExp('^do'), new RegExp('^m.l'), new RegExp('^pro'), new RegExp('^s.e'), new RegExp('am.$'), new RegExp('b.$'), new RegExp('rus$')],
	[new RegExp('..az.'), new RegExp('.af.'), new RegExp('.ah..'), new RegExp('.bl.'), new RegExp('.cy.'), new RegExp('.e.v.'), new RegExp('.ew.'), new RegExp('.gl.'), new RegExp('.h.m.'), new RegExp('.hal.'), new RegExp('.iel.'), new RegExp('.k.m.'), new RegExp('.kl.'), new RegExp('.lb..'), new RegExp('.p.$'), new RegExp('.p.s.'), new RegExp('.pha.'), new RegExp('.qu..'), new RegExp('.ras.'), new RegExp('.t.d.'), new RegExp('.yt.'), new RegExp('.yt..'), new RegExp('^.k'), new RegExp('^c.a'), new RegExp('^c.l'), new RegExp('^nep'), new RegExp('^s.b'), new RegExp('p.$'), new RegExp('s.e$'), new RegExp('t.r$'), new RegExp('y.i$')],
	[new RegExp('..cy.'), new RegExp('..j$'), new RegExp('..ok.'), new RegExp('..q.'), new RegExp('..q..'), new RegExp('..zn.'), new RegExp('.alo.'), new RegExp('.ber.'), new RegExp('.ds.'), new RegExp('.ee.'), new RegExp('.ela.'), new RegExp('.eru.'), new RegExp('.gn.'), new RegExp('.j$'), new RegExp('.kl..'), new RegExp('.lar.'), new RegExp('.ld.'), new RegExp('.mat.'), new RegExp('.pro.'), new RegExp('.ron.'), new RegExp('.tal.'), new RegExp('.zn.'), new RegExp('^.nt'), new RegExp('^n.o'), new RegExp('^s.i'), new RegExp('emu$'), new RegExp('ina$'), new RegExp('j$'), new RegExp('or.$'), new RegExp('ria$'), new RegExp('se.$')],
	[new RegExp('..gl.'), new RegExp('..kl.'), new RegExp('.af..'), new RegExp('.b.o.'), new RegExp('.cul.'), new RegExp('.d.u.'), new RegExp('.ert.'), new RegExp('.f.e.'), new RegExp('.gl..'), new RegExp('.han.'), new RegExp('.ht.'), new RegExp('.i.b.'), new RegExp('.los.'), new RegExp('.n.d.'), new RegExp('.nat.'), new RegExp('.nta.'), new RegExp('.ona.'), new RegExp('.ont.'), new RegExp('.orm.'), new RegExp('.p.c.'), new RegExp('.per.'), new RegExp('.rze.'), new RegExp('.tor.'), new RegExp('.z.i.'), new RegExp('^.ul'), new RegExp('^neo'), new RegExp('^p.a'), new RegExp('^ta.'), new RegExp('d.e$'), new RegExp('r.e$'), new RegExp('t.n$')],
	[new RegExp('..gn.'), new RegExp('..qu.'), new RegExp('..ua.'), new RegExp('..ui.'), new RegExp('..yn.'), new RegExp('.bl..'), new RegExp('.col.'), new RegExp('.ds..'), new RegExp('.g.t.'), new RegExp('.h.c.'), new RegExp('.ici.'), new RegExp('.jo.'), new RegExp('.k.w.'), new RegExp('.l.z.'), new RegExp('.lis.'), new RegExp('.n.g.'), new RegExp('.ner.'), new RegExp('.of.'), new RegExp('.pp.'), new RegExp('.tin.'), new RegExp('.ug.'), new RegExp('^li'), new RegExp('^li.'), new RegExp('^ta'), new RegExp('^v.r'), new RegExp('^ve.'), new RegExp('ium$'), new RegExp('n.i$'), new RegExp('rum$'), new RegExp('tes$'), new RegExp('ymi$')],
	[new RegExp('..bl.'), new RegExp('..d$'), new RegExp('..ew.'), new RegExp('..ht.'), new RegExp('..ld.'), new RegExp('.b.u.'), new RegExp('.cy..'), new RegExp('.d$'), new RegExp('.gn..'), new RegExp('.h.u.'), new RegExp('.k.v.'), new RegExp('.ld..'), new RegExp('.mu..'), new RegExp('.ng$'), new RegExp('.nin.'), new RegExp('.of..'), new RegExp('.oru.'), new RegExp('.por.'), new RegExp('.s.y.'), new RegExp('.tar.'), new RegExp('^.v.'), new RegExp('^a.r'), new RegExp('^ve'), new RegExp('a.s$'), new RegExp('c.a$'), new RegExp('cus$'), new RegExp('d$'), new RegExp('ene$'), new RegExp('ng$'), new RegExp('nia$'), new RegExp('w..$')],
	[new RegExp('..ds.'), new RegExp('..wy.'), new RegExp('.c.c.'), new RegExp('.car.'), new RegExp('.cen.'), new RegExp('.ht..'), new RegExp('.jo..'), new RegExp('.ln.'), new RegExp('.ole.'), new RegExp('.phi.'), new RegExp('.pp..'), new RegExp('.r.w.'), new RegExp('.ram.'), new RegExp('.sh.'), new RegExp('.sim.'), new RegExp('.uk.'), new RegExp('.w.$'), new RegExp('.wy.'), new RegExp('.y.h.'), new RegExp('^.ap'), new RegExp('^.ez'), new RegExp('^.v'), new RegExp('^b.r'), new RegExp('^bo.'), new RegExp('^gr.'), new RegExp('^m.c'), new RegExp('s.i$'), new RegExp('t.a$'), new RegExp('w.$'), new RegExp('y.h$'), new RegExp('yc.$')]
];
function queryBF(q, bf, xx, s){
	function error(x, s){
		if(s === 0){
			return(x);
		} else {
			if(s >= Math.random()){
				if(x === 0){
					return(1);
				} else {
					return(0);
				}
			} else {
				return(x);
			}
		}
	}
	const h = xx.h64(q);
	let hk = parseInt(h.substring(0, 8), 16)%bf.m;
	const hb = parseInt(h.substring(8, 16), 16);
	for(let k = bf.k-1; k >= 0; k--){
		if(hk < 0){
			if((bf.f[Math.floor((hk+bf.m)/32)] & (1 << ((hk+bf.m)%32))) === 0){
				return(error(0, s));
			}
		} else {
			if((bf.f[Math.floor(hk/32)] & (1 << (hk%32))) === 0){
				return(error(0, s));
			}
		}
		hk = (hk+hb)%bf.m;
	}
	return(error(1, s));
}
const readline = require('readline');
let s = 0;
const t = process.hrtime();
const tf = require('@tensorflow/tfjs-node');
for(let k = process.argv.length-1; k >= 0; k--){
	if(process.argv[k] === '-b'){
		if(checkFile(process.argv[k+1]) === true){
			b = process.argv[k+1];
		}
	} else if(process.argv[k] === '-e'){
		if(checkFile(process.argv[k+1]) === true){
			e = process.argv[k+1];
		}
	} else if(process.argv[k] === '-i'){
		if(checkFile(process.argv[k+1]) === true){
			i = process.argv[k+1];
		}
	} else if(process.argv[k] === '-l'){
		if(checkFile(process.argv[k+1]) === true){
			l = process.argv[k+1];
		}
	} else if(process.argv[k] === '-p'){
		if(checkFile(process.argv[k+1]) === true){
			p = process.argv[k+1];
		}
	} else if(process.argv[k] === '-s'){
		s = parseFloat(process.argv[k+1], 10);
		if((isNaN(s) === true) || (s < 0) || (s > 1)){
			s = 0;
		}
	}
}
let xxhash = require('xxhash-wasm');
if((notNULL(b) === true) && (notNULL(e) === true) && (notNULL(i) === true) && (notNULL(l) === true) && (notNULL(p) === true)){
	const blob = fs.readFileSync(b);
	const bf = filter.read(new Pbf(blob));
	xxhash().then(function(xx){
		tf.loadLayersModel('file://' + e).then(function(ecnn){
			const we = ecnn.getLayer('inputLayer').batchInputShape[1]/7;
			tf.loadLayersModel('file://' + l).then(function(lcnn){
				const wl = lcnn.getLayer('inputLayer').batchInputShape[1];
				tf.loadLayersModel('file://' + p).then(function(pdffnn){
					const wp = pdffnn.getLayer('inputLayer').batchInputShape[1]
					let input = readline.createInterface({
						input: fs.createReadStream(i),
						output: process.stdout,
						terminal: false
					});
					let j = 0;
					let buffer = '';
					input.on('line', function(line){
						line = line.trim();
						if(line.length > 0){
							j++;
							const x = line.split(',');
							let y = flatten(x[1]);
							let z = y.replace(/[^a-z]/g, ' ').split('');
							/* bloom filter */
							buffer += x[0] + ',' + x[1] + ',' + queryBF(y, bf, xx, s);
							/* ecnn */
							let o = ecnn.predict(tf.tensor2d(eudex(z, we), [1, we*7]), {
								batchSize: 1,
								verbose: false
							});
							buffer += ',' + Math.fround(o.dataSync()[1]).toFixed(7);
							/* lcnn */
							let q = new Int32Array(wl).fill(0);
							let e = z.length;
							if(e > wl){
								e = wl;
							}
							for(let k = e-1; k >= 0; k--){
								q[k] = c2i[z[k]];
							}
							o = lcnn.predict(tf.tensor2d(q, [1, wl]), {
								batchSize: 1,
								verbose: false
							});
							buffer += ',' + Math.fround(o.dataSync()[1]).toFixed(7);
							/* pdffnn */
							q = new Int32Array(pseudosyllables.length).fill(0);
							for(let k = pseudosyllables.length-1; k >= 0; k--){
								for(let j = pseudosyllables[k].length-1; j >= 0; j--){
									q[k] = q[k] << 1;
									if((y.split(pseudosyllables[k][j]).length-1) > 0){
										q[k] = q[k] | 1;
									}
								}
							}
							o = pdffnn.predict(tf.tensor2d(q, [1, wp]), {
								batchSize: 1,
								verbose: false
							});
							buffer += ',' + Math.fround(o.dataSync()[1]).toFixed(7) + '\n';
							if(buffer.length > 10240){
								process.stdout.write(buffer, 'UTF8');
								buffer = '';
							}
						}
						return(false);
					}).on('close', function(){
						process.stdout.write(buffer, 'UTF8');
						let x = process.hrtime(t);
						process.stderr.write('\n' + j + ' words processed in ' + x[0].toFixed(0) + 's ' + (x[1]/1000000).toFixed(6) + 'ms\n', 'UTF8');
						return(false);
					});
				});
			});
		});
	});
} else {
	let o	=	'\nA JavaScript for running bf, ecnn, lcnn, and pdffnn on a list of words.\n'
			+	'This script requies lodash, pbf, tfjs-node, and xxhash-wasm.\n'
			+	'Input data should have class ID and input word separated by a comma.\n'
			+	'usage: scientificNames-ensemble.js -b bf.pbf -e ecnn.json -i input.csv\n'
			+	'-l lcnn.json -p pdffnn.json [ -s simulated-bloom-filter-error-rate ]\n\n';
	process.stderr.write(o, 'UTF8');
}
function checkFile(file){
	try {
		return(fs.statSync(file).isFile());
	} catch(error){
		return(false);
	}
}
function flatten(x){
	return(deburr(x.normalize('NFC').toLowerCase()).replace(/[ɨⅱaắằẵẳặấầẫẩậǎảȃạªbcdḍeếềễểệẽẻẹəfgǵǧhḩḥiǐỉịjkḱlḷmnṅṇoốồỗổộỏọơớờỡởợºpqrṛṟsṡșṣtțṭṯuǔủụưứừữửựvwxyỳỹȳỷzẓ]/g, function(y){
		return({
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
		}[y]); })
	);
}
function notNULL(x){
	return(Object.prototype.toString.call(x) === '[object String]');
}
