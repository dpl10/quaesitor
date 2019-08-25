/* imports from node_modules */
import * as tf from '@tensorflow/tfjs';
import LRUCache from 'mnemonist/lru-cache';
import { InferenceModel, Tensor } from '@tensorflow/tfjs';
/* imports from module */
import { Flatten } from './flatten';
import { RegularExpression, exclusionSet, dash, html, separator } from './regular-expression';
import { ScientificName } from './scientific-name';
import { XXhash } from './xxhash';
import { c2i, injectivePhones, phones } from './encoder';
/* imports from assets */
const ecnnJSON = require('./assets/ecnn.json');
const ecnnPBF = require('./assets/ecnn.pbf');
const edffnnJSON = require('./assets/edffnn.json');
const edffnnPBF = require('./assets/edffnn.pbf');
const lcnnJSON = require('./assets/lcnn.json');
const lcnnPBF = require('./assets/lcnn.pbf');
const pcnnJSON = require('./assets/pcnn.json');
const pcnnPBF = require('./assets/pcnn.pbf');
export class Quaesitor {
	private ecnn: InferenceModel|any;
	private ecnnWidth: number = 464;
	private edffnn: InferenceModel|any;
	private edffnnWidth: number = 3;
	private flatten: Flatten = new Flatten();
	private lcnn: InferenceModel|any;
	private lcnnWidth: number = 58;
	private pcnn: InferenceModel|any;
	private pcnnWidth: number = 1097;
	private pseudosyllables: Array<string|RegExp> = ['...i.', '.o..', '.r..', '..r.', '...n.', '.r...', '..n.', '.o.', '.i...', '.n..', '..i.', '..i..', '.o...', '.r.', '.i..', '.n.', '..r..', '..n..', '..o.', '..a..', '...a.', '..e..', '.s.', '.a...', '.t.', '.n...', '...r.', '..s.', '..o..', '.i.', '...o.', '.s..', '..t.', '...e.', '..a.', '.l.', '..s..', '.e...', '.t..', '...t.', '..l.', '..t..', '...s.', '.l..', '.s...', '.a..', '..e.', '.t...', '.e..', '..l..', '.a.', '.l...', '...l.', '.c.', '.e.', '..c.', '.u.', '.u..', '...c.', '.m.', '.c..', '.u...', '..m.', '..u.', '..c..', '.d.', '.c...', '.k.', '..d.', '..u..', '.d..', '...m.', '...u.', '..k.', '..d..', '.k..', '^.e', '^.e.', '..k..', 'e.$', '.e.$', '.d...', '...k.', '...d.', '.k...', '.p.', '.p..', '.z.', '.m..', '.g.', '..g.', '..z.', '.p...', '.z..', '..z..', '..p.', '.er.', '..m..', '..p..', '.z...', '.h.', '.g..', '.m...', '.an.', '.y.', '..g..', '^n', '^n.', '^n..', '...g.', '.v.', 's$', '.s$', '..s$', '.b.', '..h.', '.h..', '.er..', '.en.', '..v.', '..an.', '..er.', '...z.', 'e$', '.e$', '..e$', '.b..', '.g...', '.v..', '.y..', '..b.', '..h..', '..y.', '.h...', '..en.', '^.a', '^.a.', '...h.', '..v..', '.an..', '..b..', '...v.', '.b...', '...y.', 'e..$', '.v...', '...p.', '^.i', '^.i.', '^.o', '^.o.', '...b.', '..y..', '.en..', 'a..$', '.te.', '.w.', '.ie.', '..te.', '.st.', '..w.', '.y...', '^..e', '..st.', '.w..', '.j.', '...w.', 'i..$', 'n.$', '.n.$', '.ie..', '..w..', '.st..', '.a.i.', '..j.', '.ra.', '.o.a.', '.a.e.', '.j..', '.w...', '.al.', '...j.', '.ar.', 'i$', '.i$', '..i$', '.e.e.', '.re.', '..j..', '^..r', '.ra..', '.ni.', 'a$', '.a$', '..a$', '.in.', '..ni.', '.te..', '.ar..', '..ra.', '.f.', 'm.$', '.m.$', '.n.e.', '..al.', '^s', '^s.', '^s..', 'i.$', '.i.$', '.j...', 'n$', '.n$', '..n$', '.al..', '^p', '^p.', '^p..', '.f..', '.ne.', '.a.a.', '..f.', '.e.a.', '^ne', '^ne.', '^.r', '^.r.', '..ne.', '.ro.', '..f..', '..re.', '.f...', '..in.', '.s.e.', 'n..$', '.in..', '..ar.', '.la.', '.ro..', '.re..', '.e.i.', '.ch.', '.ni..', '.e.s.', '.es.', '.e.t.', '.e.o.', '.ri.', '.el.', 'm$', '.m$', '..m$', '.ch..', '.on.', '^..s', '.or.', '.la..', '...f.', '.li.', '..ch.', '.le.', '.es..', '.at.', '..la.', '.r.e.', '..li.', '.ri..', '.li..', '.or..', '.el..', '..ro.', '.o.e.', '..ie.', '^..n', 'a.$', '.a.$', '.ic.', '..le.', '..ri.', '.ne..', '.on..', '.a.o.', '..el.', '.ow.', 't..$', '.ta.', '..at.', '..ic.', '..ow.', '^.ie', '.is.', '.ac.', '.at..', '.as.', '.ov.', '.ti.', '^..l', '.va.', 'en$', '.en$', '..on.', 's..$', '^..a', '.o.i.', '..ti.', '.i.a.', '.le..', '^a', '^a.', '^a..', '..ov.', '.ta..', 'c.$', '.c.$', '..va.', '.is..', '..ta.', '.i.e.', '.de.', 'r..$', '.as..', 't.$', '.t.$', '^ni', '^ni.', '.ti..', '.os.', '..or.', 'o$', '.o$', '..o$', '..es.', '..de.', '.va..', '^n.e', '.r.n.', '.ow..', '.ng.', '.t.r.', '.s.i.', '.et.', '.n.s.', '^.u', '^.u.', '^nie', '^..o', '.a.t.', 'o..$', '.se.', '.ov..', '.ge.', '..ac.', '..is.', '..ge.', '^..t', '.nd.', '.e.n.', '..se.', '..ng.', '.si.', '.lo.', '.ng..', '..si.', '.os..', '.e.r.', '.tr.', '.ic..', '.s.a.', '.na.', '.r.a.', '.to.', '.tr..', '..as.', '.ko.', '.nt.', '..nd.', '.ia.', '.ol.', '.lo..', '.no.', '.i.n.', '.wa.', '..os.', '.n.a.', '..na.', '^d', '^d.', '^d..', '.o.o.', '..to.', '.em.', '..wa.', '.am.', 'o.$', '.o.$', '.et..', '..lo.', '..ko.', '.ac..', '..no.', '..et.', '..ia.', '.to..', '.nd..', '.i.i.', '..tr.', '.o.t.', '.ol..', '.wa..', '^b', '^b.', '^b..', '^..p', '.nt..', '.it.', '.ko..', '.na..', 't$', '.t$', '..t$', '^..i', '.ci.', '.ei.', '.a.s.', 'y$', '.y$', '..y$', '.il.', '.ns.', '^r', '^r.', '^r..', '.no..', '..ci.', 'l..$', '.ia..', '.si..', '.s.o.', '.se..', 'l.$', '.l.$', '^k', '^k.', '^k..', '.i.t.', '.s.r.', '.ns..', '.i.o.', '.sc.', '.sk.', '.de..', '..ns.', 'r.$', '.r.$', '..sk.', '^m', '^m.', '.ep.', '^m..', '..em.', '.l.n.', '..nt.', 'r$', '.r$', '..r$', '.r.i.', '^.n', '^.n.', '.ep..', '.r.s.', '..it.', '..sc.', 'es$', '.es$', '.it..', '.t.n.', '^..z', '.sc..', '.il..', '..am.', 'h$', '.h$', '..h$', 'u$', '.u$', '..u$', '.un.', '.l.e.', '^..d', '.me.', '.ed.', '.ze.', '..ei.', '.ge..', 'ch$', '.ch$', '.za.', '.e.l.', '.ka.', '.ss.', '.sk..', '^c', '^c.', '^c..', '.l.s.', 'y..$', '.ec.', '..ze.', '..me.', '..il.', '..ol.', '.ed..', '.ei..', '.t.e.', '..za.', '..ss.', '.ma.', '^t', '^t.', '^t..', '.za..', 'mi$', '.mi$', '.ad.', '^e', '^e.', '^e..', '.c.e.', '.ve.', '^..c', '..ka.', '.v.n.', '.av.', 'c..$', '.am..', '.ka..', '.ma..', '.io.', '^.l', '^.l.', '.o.s.', '.t.a.', 'te.$', '^o', '^o.', '^o..', '.e.d.', '.ze..', '.pr.', '.pr..', '..ma.', '.ste.', 's.$', '.s.$', '.i.g.', '^..m', '^f', '^f.', '^f..', '.u.e.', '..un.', '.po.', '^..u', '.ll.', '^z', '^z.', '^z..', '.un..', '.a.y.', '..ve.', '.ej.', 'en.$', '.n.o.', '.me..', '.po..', '.ss..', '.r.t.', 'e.s$', '..io.', '.av..', '.ova.', '..av.', '.om.', '.eg.', '.u.a.', '.ci..', '.od.', '.i.s.', '.ha.', '.ad..', '.ec..', '..ll.', '..ej.', '.im.', '.od..', '.t.l.', '..pr.', '.be.', '.ve..', '.us.', '.ej..', '.a.d.', '.ru.', '.i.r.', '.he.', '.ha..', '^h', '^h.', '^h..', '..ec.', '.em..', '.om..', '.n.r.', '.n.i.', '..po.', '.rz.', '.m.n.', '..ad.', '.i.l.', '.mo.', '.us..', '.ot.', '.n.t.', 'an.$', '^g', '^g.', '^g..', '.r.c.', '.rz..', '..be.', '.be..', '.ur.', '.do.', '..im.', '.a.n.', '^v', '^v.', '^v..', 'u.$', '.u.$', '..he.', '..ha.', '..mo.', '.ek.', '.sa.', '^pr', '^pr.', '.mi.', '.t.i.', '.r.o.', '..do.', '.t.o.', 'd..$', '.c.n.', '.owa.', '.ek..', '.ru..', '.ll..', '..sa.', 'er$', '.er$', '.ot..', '.io..', '.van.', '.rt.', '.n.m.', '.ter.', '.n.n.', '.c.a.', '.s.h.', '.ani.', '..eg.', '.s.n.', '.rs.', '..mi.', '^.y', '^.y.', '.ur..', '.ab.', '.sa..', '..ed.', '.op.', '.do..', '.mi..', 'ne$', '.ne$', '.ke.', '..rt.', '.cz.', '..ke.', '^l', '^l.', '^l..', '.pe.', '..rs.', '..cz.', '.n.c.', '.rs..', '.l.t.', '.op..', '.pa.', '^.er', '.o.r.', '.tu.', '.ez.', '.rt..', '.oz.', '..ru.', '.ez..', '.cz..', '.oz..', '.i.k.', 'em$', '.em$', '.e.k.', '^w', '^w.', '^w..', '.ing.', '..om.', '.rn.', '.a.r.', '.u.i.', '.a.l.', '^..g', 'g..$', '^..k', '^..b', '.pa..', '^po', '^po.', '.e.u.', '.k.e.', '..od.', '..rn.', '.di.', '.ab..', '..tu.', '.da.', '.i.c.', '..ep.', 'te$', '.te$', '..ot.', '.ce.', '.o.y.', '..da.', '..us.', '.ba.', '..pe.', '..di.', '.t.c.', '.pe..', '.ys.', '.ga.', 'm..$', '.he..', 'u..$', '^.t', '^.t.', '.ul.', '..pa.', '.ere.', '.d.r.', '.ys..', '.yc.', '.pi.', '..ce.', '.ym.', '..ga.', '^.es', 'y.$', '.y.$', '.p.e.', '..ba.', '..ek.', '.g.n.', '.eg..', '^u', '^u.', '^u..', '.o.n.', '.ag.', '.ut.', '.l.b.', '.di..', 'e.e$', '.lu.', '.w.n.', '.sch.', '.ig.', '.z.n.', '.ny.', 'a.e$', '..ny.', '.s.m.', '..ab.', '.js.', 'a.i$', '..js.', '..ur.', '.gs.', '.ost.', '..gs.', '.oc.', '.l.a.', '.r.m.', '.a.k.', '.pi..', '..op.', '.sp.', '.ak.', '.sp..', '.ul..', '.gs..', '.p.r.', 'er.$', '.ik.', '..yc.', '.id.', '.tu..', '.oc..', '.ap.', '.ga..', '.ba..', '..ym.', '.n.l.', '.i.u.', 'k.$', '.k.$', 'ne.$', '.ap..', '.mo..', '.i.m.', '.au.', '.tt.', 'is$', '.is$', '.o.l.', '.ejs.', '.wi.', '..rz.', '.ja.', '.ag..', 'k..$', '.ig..', '.ce..', '.a.u.', '.ut..', '.l.r.', '.ak..', 'g.$', '.g.$', '.da..', '.uj.', '.ca.', '.so.', '.u.t.', '.y.a.', '.t.s.', '.iz.', '^.ar', '^..v', '..uj.', '.ho.', '.and.', '.k.n.', '.ke..', '^i', '^i.', '^i..', '.l.c.', '.lu..', '..sp.', '.nge.', '..pi.', '.j.i.', '^..h', '.rn..', '.r.z.', '.ik..', 'ie$', '.ie$', '..ja.', '..tt.', '.id..', '..ig.', '.r.d.', '.zo.', '.l.i.', '..so.', '..ys.', 'a.a$', '.c.o.', '.au..', '.iz..', '.e.c.', '.aj.', '.s.u.', '.ja..', '..ik.', '.l.g.', '.d.n.', '..iz.', '.js..', '.so..', '.wan.', '.wi..', '.u.o.', '..ca.', '.ava.', '.m.e.', '..zo.', '..wi.', '.ho..', '.eb.', '..id.', '.w.l.', '.v.r.', '.e.z.', '.ck.', '.zo..', '.tt..', '.ki.', '..ut.', '.i.h.', '..lu.', '..ck.', 'g$', '.g$', '..g$', '^.p', '^.p.', '.eb..', '.r.k.', '.u.g.', '.r.u.', '.ca..', 're.$', '..ul.', '.p.a.', '.e.b.', '.est.', '.e.y.', '.ent.', '.co.', '.n.j.', '.nn.', '.j.c.', '..ho.', '.r.l.', '.ane.', '.p.o.', 'd.$', '.d.$', '.ali.', '.ob.', 'im.$', '.m.t.', '.g.a.', '..ag.', '^.or', '^..j', '.ier.', '.og.', '.bi.', '..ki.', 'ym.$', '.uj..', '.ev.', '.nde.', '..oc.', '.m.r.', '.d.a.', '.e.m.', '.d.i.', '.eo.', '.o.u.', 'ic.$', '.n.u.', 'em.$', '^de', '^de.', '.sz.', '.b.r.', '^.ep', '.ts.', '.g.e.', '.uc.', '.eo..', '.co..', '..bi.', 'ge.$', 'mu$', '.mu$', '..co.', '.vi.', '.og..', '.r.v.', '.ev..', '..aj.', '.i.d.', 'ns$', '.ns$', '.bi..', '.zy.', '.je.', '.ts..', '.aj..', '..ts.', 'ni.$', '.h.e.', '.ir.', '.we.', '.ist.', 'as$', '.as$', '.sm.', '.str.', '.e.p.', 'e.o$', '.d.e.', '..sz.', '.i.z.', '.ngs.', '.e.h.', '..zy.', '.ea.', 'de.$', '^.s', '^.s.', '^re', '^re.', '.f.r.', '.r.p.', '.g.r.', '.a.c.', '.o.d.', '.nn..', '.zy..', '.o.k.', '..nn.', '..ak.', '.vi..', '.a.z.', '.kr.', '.ob..', 'j..$', '..sm.', '.kr..', '.s.l.', '.eh.', '.uc..', '.jsi.', '.ou.', '..we.', '.eu.', '.p.l.', '.nos.', '.i.p.', '.ny..', '.c.l.', 'v..$', '.nk.', '.zi.', '.e.g.', '.kt.', '.wal.', '.sz..', '.ens.', '.era.', '.rd.', '..vi.', '.l.o.', '.rk.', '.t.t.', '.rm.', 'h.$', '.h.$', '.che.', '.ki..', '.gr.', '^.c', '^.c.', '.ir..', '.eri.', 'ym$', '.ym$', '.ty.', '.ck..', '.c.i.', '..og.', '..au.', '^.an', '.gr..', '..kt.', '.iv.'];
	private queryCache: LRUCache<string, boolean> = new LRUCache(8192);
	private regularExpression: RegularExpression = new RegularExpression();
	private xxhash: XXhash = new XXhash();
	constructor(){
		for(let k = this.pseudosyllables.length-1; k >= 0; k--){
			this.pseudosyllables[k] = new RegExp(this.pseudosyllables[k]);
		}
		this.ecnn = tf.loadLayersModel(ecnnJSON).then(() => {
			this.ecnnWidth = this.ecnn.getLayer('embedding').batchInputShape[1];
			this.ecnn.predict(tf.tensor2d(new Int32Array(this.ecnnWidth).fill(0), [1, this.ecnnWidth]), {
				batchSize: 1,
				verbose: false
			}).dispose(); /* if it is not primed, it will not work... wft */
			console.log('ecnn loaded, model size =', ecnnPBF.size); /* a kluge to force webpack to include the weight file */
		});
		this.edffnn = tf.loadLayersModel(edffnnJSON).then(() => {
			this.edffnnWidth = this.edffnn.getLayer('embedding').batchInputShape[1];
			this.edffnn.predict(tf.tensor2d(new Float32Array(this.edffnnWidth).fill(1.0), [1, this.edffnnWidth]), {
				batchSize: 1,
				verbose: false
			}).dispose(); /* if it is not primed, it will not work... wft */
			console.log('edffnn loaded, model size =', edffnnPBF.size); /* a kluge to force webpack to include the weight file */
		});
		this.lcnn = tf.loadLayersModel(lcnnJSON).then(() => {
			this.lcnnWidth = this.lcnn.getLayer('embedding').batchInputShape[1];
			this.lcnn.predict(tf.tensor2d(new Int32Array(this.lcnnWidth).fill(1), [1, this.lcnnWidth]), {
				batchSize: 1,
				verbose: false
			}).dispose(); /* if it is not primed, it will not work... wft */
			console.log('lcnn loaded, model size =', lcnnPBF.size); /* a kluge to force webpack to include the weight file */
		});
		this.pcnn = tf.loadLayersModel(pcnnJSON).then(() => {
			this.pcnnWidth = this.pcnn.getLayer('embedding').batchInputShape[1];
			this.pcnn.predict(tf.tensor2d(new Int32Array(this.pcnnWidth).fill(0), [1, this.pcnnWidth]), {
				batchSize: 1,
				verbose: false
			}).dispose(); /* if it is not primed, it will not work... wft */
			console.log('pcnn loaded, model size =', pcnnPBF.size); /* a kluge to force webpack to include the weight file */
		});
	}
	public async extractSpecies(x: string): Promise<Array<string>> {
		const taxa: Array<ScientificName> = [];
		const y = x.normalize('NFC').replace(html, '').replace(dash, '-').replace(/-+/g, '-').replace(/ -\n/g, ' - ').replace(/-\n/g, '').replace(separator, ' ').replace(/\r\n|\r|\n/g, ' ').replace(/ +/g, ' ').split(/ /);
		for(let k = y.length-1; k >= 0; k--){
			if((y[k] != null) && (exclusionSet.test(y[k]) === false)){ /* removes all non-Latin languages from consideration */
				let z: ScientificName = new ScientificName();
				let max: number = 20; /* assuming a max of three authors (four tokens): Genus(1) species(2) author(3-6) subsp.(7) subspecies(8) author(9-12) var.(13) variety(14) author(15-18) f.(19) forma(20) */
				if((y.length-k) < max){
					max = y.length-1;
				} else {
					max += k;
				}
				for(let j = max; j > k; j--){
					if((y[j] === 'subsp.') || (y[j] === 'var.') || (y[j] === 'f.') || (y[j] === 'fm.')){
						z = this.regularExpression.scientificNameExtract(y.slice(k, j+2).join(' '));
						break;
					}
				}
				if(z.extracted === false){
					z = this.regularExpression.scientificNameExtract(y.slice(k, k+3).join(' '));
					if(z.extracted === false){
						z = this.regularExpression.scientificNameExtract(y.slice(k, k+2).join(' '));
					}
				}
				if(z.extracted === true){
					let insert: boolean = true;
					for(const name in z){
						if((name === 'Genus') && (this.regularExpression.abbreviatedGenus(z.Genus) === true)){
							continue;
						} else if(((name === 'Genus') || (name === 'species')) && (await this.query(z[name]) === false)){
							insert = false;
							break;
						} else if(((name === 'forma') || (name === 'subspecies') || (name === 'variety')) && (await this.query(z[name]) === false)){
							delete(z[name]);
						}
					}
					if(insert === true){
						taxa.push(z);
					} else {
					}
				}
			}
		}
		let currentGenus: string = '';
		let currentGenusAbbreviated: RegExp = new RegExp(/^[]/);
		const h: any = {};
		const uniq: Array<string> = [];
		for(let k = taxa.length-1; k >= 0; k--){
			if(this.regularExpression.abbreviatedGenus(taxa[k].Genus) === true){
				if((currentGenus.length > 0) && (currentGenusAbbreviated.test(taxa[k].Genus) === true)){
					taxa[k].Genus = currentGenus;
				}
			} else {
				currentGenus = taxa[k].Genus;
				let r: string = '^' + taxa[k].Genus.charAt(0) + taxa[k].Genus.charAt(1) + '{0,1}';
				if(taxa[k].Genus.length >= 3){
					r += taxa[k].Genus.charAt(2) + '{0,1}';
				}
				currentGenusAbbreviated = new RegExp(r + '\.$');
			}
			const t: string = taxa[k].formatName(true);
			const h64: string = await this.xxhash.h64(t);
			if(h[h64] === undefined){
				h[h64] = true;
				uniq.push(t);
			}
		}
		return(uniq);
	}
	private async query(x: string): Promise<boolean> {
		if(this.queryCache.has(x) === true){
			return(this.queryCache.get(x));
		} else {
			let r: boolean = false;
			const q = new Float32Array(3).fill(0.0);
			const y: string = this.flatten.squash(x);
			const z: Array<string> = y.replace(/[^a-z]/g, ' ').split('');
			q[0] = this.queryECNN(z);
			q[1] = this.queryLCNN(z);
			q[2] = this.queryPCNN(y);
			if(this.queryEDFFNN(q) > 0.5){
				r = true;
			}
			this.queryCache.set(x, r);
			return(r);
		}
	}
	private queryECNN(x: Array<string>): number { /* based on the Eudex hash (https://github.com/ticki/eudex) */
		const y: Int32Array = new Int32Array(this.ecnnWidth).fill(1);
		let l: number = x.length;
		if(l > (this.ecnnWidth/8)){
			l = this.ecnnWidth/8;
		}
		for(let k = l-1; k >= 0; k--){
			if(k === 0){
				y.set(injectivePhones[x[k]], 0);
			} else {
				y.set(phones[x[k]], (k*8));
			}
		}
		const p = this.ecnn.predict(tf.tensor2d(y, [1, this.ecnnWidth]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(Math.fround(p.dataSync()[1]));
	}
	private queryEDFFNN(x: Float32Array): number {
		const p = this.edffnn.predict(tf.tensor2d(x, [1, this.edffnnWidth]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(p.dataSync()[1]);
	}
	private queryLCNN(x: Array<string>): number {
		const y: Int32Array = new Int32Array(this.lcnnWidth).fill(0);
		let l: number = x.length;
		if(l > this.lcnnWidth){
			l = this.lcnnWidth;
		}
		for(let k = l-1; k >= 0; k--){
			y[k] = c2i[x[k]];
		}
		const p = this.lcnn.predict(tf.tensor2d(y, [1, this.lcnnWidth]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(Math.fround(p.dataSync()[1]));
	}
	private queryPCNN(x: string): number {
		const y: Int32Array = new Int32Array(this.pcnnWidth).fill(1);
		for(let k = this.pseudosyllables.length-1; k >= 0; k--){
			if((x.split(this.pseudosyllables[k]).length-1) === 0){
				y[k] = 0;
			}
		}
		const p = this.pcnn.predict(tf.tensor2d(y, [1, this.pcnnWidth]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(Math.fround(p.dataSync()[1]));
	}
}
