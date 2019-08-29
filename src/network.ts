/* imports from node_modules */
//#ifdef NODE
import * as tf from '@tensorflow/tfjs-node';
//#else
import * as tf from '@tensorflow/tfjs';
//#endif
import { Tensor } from '@tensorflow/tfjs';
/* imports from module */
import { Model, ModelLoaded, ModelTypeDeep, ModelWidth } from './model';
import { c2i, injectivePhones, phones } from './encoder';
/* imports from (webpacked) assets (.json files manually edited so that the paths property reflectes the file names used) */
const modelJSON = new Model();
modelJSON.ecnn = require('./assets/ecnn.json');
modelJSON.edffnn = require('./assets/edffnn.json');
modelJSON.lcnn = require('./assets/lcnn.json');
modelJSON.pcnn = require('./assets/pcnn.json');
export class Network {
	private loaded: ModelLoaded = new ModelLoaded();
	private model: Model = new Model();
	private modelDeep: ModelTypeDeep = new ModelTypeDeep();
	private pseudosyllables: Array<string|RegExp> = ['...i.', '.o..', '.r..', '..r.', '...n.', '.r...', '..n.', '.o.', '.i...', '.n..', '..i.', '..i..', '.o...', '.r.', '.i..', '.n.', '..r..', '..n..', '..o.', '..a..', '...a.', '..e..', '.s.', '.a...', '.t.', '.n...', '...r.', '..s.', '..o..', '.i.', '...o.', '.s..', '..t.', '...e.', '..a.', '.l.', '..s..', '.e...', '.t..', '...t.', '..l.', '..t..', '...s.', '.l..', '.s...', '.a..', '..e.', '.t...', '.e..', '..l..', '.a.', '.l...', '...l.', '.c.', '.e.', '..c.', '.u.', '.u..', '...c.', '.m.', '.c..', '.u...', '..m.', '..u.', '..c..', '.d.', '.c...', '.k.', '..d.', '..u..', '.d..', '...m.', '...u.', '..k.', '..d..', '.k..', '^.e', '^.e.', '..k..', 'e.$', '.e.$', '.d...', '...k.', '...d.', '.k...', '.p.', '.p..', '.z.', '.m..', '.g.', '..g.', '..z.', '.p...', '.z..', '..z..', '..p.', '.er.', '..m..', '..p..', '.z...', '.h.', '.g..', '.m...', '.an.', '.y.', '..g..', '^n', '^n.', '^n..', '...g.', '.v.', 's$', '.s$', '..s$', '.b.', '..h.', '.h..', '.er..', '.en.', '..v.', '..an.', '..er.', '...z.', 'e$', '.e$', '..e$', '.b..', '.g...', '.v..', '.y..', '..b.', '..h..', '..y.', '.h...', '..en.', '^.a', '^.a.', '...h.', '..v..', '.an..', '..b..', '...v.', '.b...', '...y.', 'e..$', '.v...', '...p.', '^.i', '^.i.', '^.o', '^.o.', '...b.', '..y..', '.en..', 'a..$', '.te.', '.w.', '.ie.', '..te.', '.st.', '..w.', '.y...', '^..e', '..st.', '.w..', '.j.', '...w.', 'i..$', 'n.$', '.n.$', '.ie..', '..w..', '.st..', '.a.i.', '..j.', '.ra.', '.o.a.', '.a.e.', '.j..', '.w...', '.al.', '...j.', '.ar.', 'i$', '.i$', '..i$', '.e.e.', '.re.', '..j..', '^..r', '.ra..', '.ni.', 'a$', '.a$', '..a$', '.in.', '..ni.', '.te..', '.ar..', '..ra.', '.f.', 'm.$', '.m.$', '.n.e.', '..al.', '^s', '^s.', '^s..', 'i.$', '.i.$', '.j...', 'n$', '.n$', '..n$', '.al..', '^p', '^p.', '^p..', '.f..', '.ne.', '.a.a.', '..f.', '.e.a.', '^ne', '^ne.', '^.r', '^.r.', '..ne.', '.ro.', '..f..', '..re.', '.f...', '..in.', '.s.e.', 'n..$', '.in..', '..ar.', '.la.', '.ro..', '.re..', '.e.i.', '.ch.', '.ni..', '.e.s.', '.es.', '.e.t.', '.e.o.', '.ri.', '.el.', 'm$', '.m$', '..m$', '.ch..', '.on.', '^..s', '.or.', '.la..', '...f.', '.li.', '..ch.', '.le.', '.es..', '.at.', '..la.', '.r.e.', '..li.', '.ri..', '.li..', '.or..', '.el..', '..ro.', '.o.e.', '..ie.', '^..n', 'a.$', '.a.$', '.ic.', '..le.', '..ri.', '.ne..', '.on..', '.a.o.', '..el.', '.ow.', 't..$', '.ta.', '..at.', '..ic.', '..ow.', '^.ie', '.is.', '.ac.', '.at..', '.as.', '.ov.', '.ti.', '^..l', '.va.', 'en$', '.en$', '..on.', 's..$', '^..a', '.o.i.', '..ti.', '.i.a.', '.le..', '^a', '^a.', '^a..', '..ov.', '.ta..', 'c.$', '.c.$', '..va.', '.is..', '..ta.', '.i.e.', '.de.', 'r..$', '.as..', 't.$', '.t.$', '^ni', '^ni.', '.ti..', '.os.', '..or.', 'o$', '.o$', '..o$', '..es.', '..de.', '.va..', '^n.e', '.r.n.', '.ow..', '.ng.', '.t.r.', '.s.i.', '.et.', '.n.s.', '^.u', '^.u.', '^nie', '^..o', '.a.t.', 'o..$', '.se.', '.ov..', '.ge.', '..ac.', '..is.', '..ge.', '^..t', '.nd.', '.e.n.', '..se.', '..ng.', '.si.', '.lo.', '.ng..', '..si.', '.os..', '.e.r.', '.tr.', '.ic..', '.s.a.', '.na.', '.r.a.', '.to.', '.tr..', '..as.', '.ko.', '.nt.', '..nd.', '.ia.', '.ol.', '.lo..', '.no.', '.i.n.', '.wa.', '..os.', '.n.a.', '..na.', '^d', '^d.', '^d..', '.o.o.', '..to.', '.em.', '..wa.', '.am.', 'o.$', '.o.$', '.et..', '..lo.', '..ko.', '.ac..', '..no.', '..et.', '..ia.', '.to..', '.nd..', '.i.i.', '..tr.', '.o.t.', '.ol..', '.wa..', '^b', '^b.', '^b..', '^..p', '.nt..', '.it.', '.ko..', '.na..', 't$', '.t$', '..t$', '^..i', '.ci.', '.ei.', '.a.s.', 'y$', '.y$', '..y$', '.il.', '.ns.', '^r', '^r.', '^r..', '.no..', '..ci.', 'l..$', '.ia..', '.si..', '.s.o.', '.se..', 'l.$', '.l.$', '^k', '^k.', '^k..', '.i.t.', '.s.r.', '.ns..', '.i.o.', '.sc.', '.sk.', '.de..', '..ns.', 'r.$', '.r.$', '..sk.', '^m', '^m.', '.ep.', '^m..', '..em.', '.l.n.', '..nt.', 'r$', '.r$', '..r$', '.r.i.', '^.n', '^.n.', '.ep..', '.r.s.', '..it.', '..sc.', 'es$', '.es$', '.it..', '.t.n.', '^..z', '.sc..', '.il..', '..am.', 'h$', '.h$', '..h$', 'u$', '.u$', '..u$', '.un.', '.l.e.', '^..d', '.me.', '.ed.', '.ze.', '..ei.', '.ge..', 'ch$', '.ch$', '.za.', '.e.l.', '.ka.', '.ss.', '.sk..', '^c', '^c.', '^c..', '.l.s.', 'y..$', '.ec.', '..ze.', '..me.', '..il.', '..ol.', '.ed..', '.ei..', '.t.e.', '..za.', '..ss.', '.ma.', '^t', '^t.', '^t..', '.za..', 'mi$', '.mi$', '.ad.', '^e', '^e.', '^e..', '.c.e.', '.ve.', '^..c', '..ka.', '.v.n.', '.av.', 'c..$', '.am..', '.ka..', '.ma..', '.io.', '^.l', '^.l.', '.o.s.', '.t.a.', 'te.$', '^o', '^o.', '^o..', '.e.d.', '.ze..', '.pr.', '.pr..', '..ma.', '.ste.', 's.$', '.s.$', '.i.g.', '^..m', '^f', '^f.', '^f..', '.u.e.', '..un.', '.po.', '^..u', '.ll.', '^z', '^z.', '^z..', '.un..', '.a.y.', '..ve.', '.ej.', 'en.$', '.n.o.', '.me..', '.po..', '.ss..', '.r.t.', 'e.s$', '..io.', '.av..', '.ova.', '..av.', '.om.', '.eg.', '.u.a.', '.ci..', '.od.', '.i.s.', '.ha.', '.ad..', '.ec..', '..ll.', '..ej.', '.im.', '.od..', '.t.l.', '..pr.', '.be.', '.ve..', '.us.', '.ej..', '.a.d.', '.ru.', '.i.r.', '.he.', '.ha..', '^h', '^h.', '^h..', '..ec.', '.em..', '.om..', '.n.r.', '.n.i.', '..po.', '.rz.', '.m.n.', '..ad.', '.i.l.', '.mo.', '.us..', '.ot.', '.n.t.', 'an.$', '^g', '^g.', '^g..', '.r.c.', '.rz..', '..be.', '.be..', '.ur.', '.do.', '..im.', '.a.n.', '^v', '^v.', '^v..', 'u.$', '.u.$', '..he.', '..ha.', '..mo.', '.ek.', '.sa.', '^pr', '^pr.', '.mi.', '.t.i.', '.r.o.', '..do.', '.t.o.', 'd..$', '.c.n.', '.owa.', '.ek..', '.ru..', '.ll..', '..sa.', 'er$', '.er$', '.ot..', '.io..', '.van.', '.rt.', '.n.m.', '.ter.', '.n.n.', '.c.a.', '.s.h.', '.ani.', '..eg.', '.s.n.', '.rs.', '..mi.', '^.y', '^.y.', '.ur..', '.ab.', '.sa..', '..ed.', '.op.', '.do..', '.mi..', 'ne$', '.ne$', '.ke.', '..rt.', '.cz.', '..ke.', '^l', '^l.', '^l..', '.pe.', '..rs.', '..cz.', '.n.c.', '.rs..', '.l.t.', '.op..', '.pa.', '^.er', '.o.r.', '.tu.', '.ez.', '.rt..', '.oz.', '..ru.', '.ez..', '.cz..', '.oz..', '.i.k.', 'em$', '.em$', '.e.k.', '^w', '^w.', '^w..', '.ing.', '..om.', '.rn.', '.a.r.', '.u.i.', '.a.l.', '^..g', 'g..$', '^..k', '^..b', '.pa..', '^po', '^po.', '.e.u.', '.k.e.', '..od.', '..rn.', '.di.', '.ab..', '..tu.', '.da.', '.i.c.', '..ep.', 'te$', '.te$', '..ot.', '.ce.', '.o.y.', '..da.', '..us.', '.ba.', '..pe.', '..di.', '.t.c.', '.pe..', '.ys.', '.ga.', 'm..$', '.he..', 'u..$', '^.t', '^.t.', '.ul.', '..pa.', '.ere.', '.d.r.', '.ys..', '.yc.', '.pi.', '..ce.', '.ym.', '..ga.', '^.es', 'y.$', '.y.$', '.p.e.', '..ba.', '..ek.', '.g.n.', '.eg..', '^u', '^u.', '^u..', '.o.n.', '.ag.', '.ut.', '.l.b.', '.di..', 'e.e$', '.lu.', '.w.n.', '.sch.', '.ig.', '.z.n.', '.ny.', 'a.e$', '..ny.', '.s.m.', '..ab.', '.js.', 'a.i$', '..js.', '..ur.', '.gs.', '.ost.', '..gs.', '.oc.', '.l.a.', '.r.m.', '.a.k.', '.pi..', '..op.', '.sp.', '.ak.', '.sp..', '.ul..', '.gs..', '.p.r.', 'er.$', '.ik.', '..yc.', '.id.', '.tu..', '.oc..', '.ap.', '.ga..', '.ba..', '..ym.', '.n.l.', '.i.u.', 'k.$', '.k.$', 'ne.$', '.ap..', '.mo..', '.i.m.', '.au.', '.tt.', 'is$', '.is$', '.o.l.', '.ejs.', '.wi.', '..rz.', '.ja.', '.ag..', 'k..$', '.ig..', '.ce..', '.a.u.', '.ut..', '.l.r.', '.ak..', 'g.$', '.g.$', '.da..', '.uj.', '.ca.', '.so.', '.u.t.', '.y.a.', '.t.s.', '.iz.', '^.ar', '^..v', '..uj.', '.ho.', '.and.', '.k.n.', '.ke..', '^i', '^i.', '^i..', '.l.c.', '.lu..', '..sp.', '.nge.', '..pi.', '.j.i.', '^..h', '.rn..', '.r.z.', '.ik..', 'ie$', '.ie$', '..ja.', '..tt.', '.id..', '..ig.', '.r.d.', '.zo.', '.l.i.', '..so.', '..ys.', 'a.a$', '.c.o.', '.au..', '.iz..', '.e.c.', '.aj.', '.s.u.', '.ja..', '..ik.', '.l.g.', '.d.n.', '..iz.', '.js..', '.so..', '.wan.', '.wi..', '.u.o.', '..ca.', '.ava.', '.m.e.', '..zo.', '..wi.', '.ho..', '.eb.', '..id.', '.w.l.', '.v.r.', '.e.z.', '.ck.', '.zo..', '.tt..', '.ki.', '..ut.', '.i.h.', '..lu.', '..ck.', 'g$', '.g$', '..g$', '^.p', '^.p.', '.eb..', '.r.k.', '.u.g.', '.r.u.', '.ca..', 're.$', '..ul.', '.p.a.', '.e.b.', '.est.', '.e.y.', '.ent.', '.co.', '.n.j.', '.nn.', '.j.c.', '..ho.', '.r.l.', '.ane.', '.p.o.', 'd.$', '.d.$', '.ali.', '.ob.', 'im.$', '.m.t.', '.g.a.', '..ag.', '^.or', '^..j', '.ier.', '.og.', '.bi.', '..ki.', 'ym.$', '.uj..', '.ev.', '.nde.', '..oc.', '.m.r.', '.d.a.', '.e.m.', '.d.i.', '.eo.', '.o.u.', 'ic.$', '.n.u.', 'em.$', '^de', '^de.', '.sz.', '.b.r.', '^.ep', '.ts.', '.g.e.', '.uc.', '.eo..', '.co..', '..bi.', 'ge.$', 'mu$', '.mu$', '..co.', '.vi.', '.og..', '.r.v.', '.ev..', '..aj.', '.i.d.', 'ns$', '.ns$', '.bi..', '.zy.', '.je.', '.ts..', '.aj..', '..ts.', 'ni.$', '.h.e.', '.ir.', '.we.', '.ist.', 'as$', '.as$', '.sm.', '.str.', '.e.p.', 'e.o$', '.d.e.', '..sz.', '.i.z.', '.ngs.', '.e.h.', '..zy.', '.ea.', 'de.$', '^.s', '^.s.', '^re', '^re.', '.f.r.', '.r.p.', '.g.r.', '.a.c.', '.o.d.', '.nn..', '.zy..', '.o.k.', '..nn.', '..ak.', '.vi..', '.a.z.', '.kr.', '.ob..', 'j..$', '..sm.', '.kr..', '.s.l.', '.eh.', '.uc..', '.jsi.', '.ou.', '..we.', '.eu.', '.p.l.', '.nos.', '.i.p.', '.ny..', '.c.l.', 'v..$', '.nk.', '.zi.', '.e.g.', '.kt.', '.wal.', '.sz..', '.ens.', '.era.', '.rd.', '..vi.', '.l.o.', '.rk.', '.t.t.', '.rm.', 'h.$', '.h.$', '.che.', '.ki..', '.gr.', '^.c', '^.c.', '.ir..', '.eri.', 'ym$', '.ym$', '.ty.', '.ck..', '.c.i.', '..og.', '..au.', '^.an', '.gr..', '..kt.', '.iv.'];
	public width: ModelWidth = new ModelWidth();
	public async load(x: Model): Promise<void> {
		for(const m in this.loaded){
			if(/ecnn|edffnn|lcnn|pcnn/.test(m) === true){ /* to get rid of an annoying TypeScipt warning */
				this.model[m] = await tf.loadLayersModel({
					load: async () => {
						return({
							convertedBy: modelJSON[m].convertedBy,
							format: modelJSON[m].format,
							generatedBy: modelJSON[m].generatedBy,
							modelTopology: modelJSON[m].modelTopology,
							userDefinedMetadata: modelJSON[m].userDefinedMetadata,
							weightData: x[m].buffer,
							weightSpecs: modelJSON[m].weightsManifest[0].weights
						});
					}
				});
				this.width[m] = this.modelDeep[m] ? this.model[m].getLayer('dense').batchInputShape[1] : this.model[m].getLayer('embedding').batchInputShape[1];
				const y = this.modelDeep[m] ? new Float32Array(this.width[m]).fill(0.5) : new Int32Array(this.width[m]).fill(0);
				const p = this.model[m].predict(tf.tensor2d(y, [1, this.width[m]]), {
					batchSize: 1,
					verbose: false
				}) as Tensor;
				if(p.dataSync()[1] > 0){ /* if it is not primed, it will not work... wft */
					this.loaded[m] = true;
				}
			}
		}
	}
	private qECNN(x: Array<string>): number { /* based on the Eudex hash (https://github.com/ticki/eudex) */
		const y: Int32Array = new Int32Array(this.width.ecnn).fill(1);
		let l: number = x.length;
		if(l > (this.width.ecnn/8)){
			l = this.width.ecnn/8;
		}
		for(let k = l-1; k >= 0; k--){
			if(k === 0){
				y.set(injectivePhones[x[k]], 0);
			} else {
				y.set(phones[x[k]], (k*8));
			}
		}
		const p = this.model.ecnn.predict(tf.tensor2d(y, [1, this.width.ecnn]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(Math.fround(p.dataSync()[1]));
	}
	private qEDFFNN(x: Float32Array): number {
		const p = this.model.edffnn.predict(tf.tensor2d(x, [1, this.width.edffnn]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(p.dataSync()[1]);
	}
	private qLCNN(x: Array<string>): number {
		const y: Int32Array = new Int32Array(this.width.lcnn).fill(0);
		let l: number = x.length;
		if(l > this.width.lcnn){
			l = this.width.lcnn;
		}
		for(let k = l-1; k >= 0; k--){
			y[k] = c2i[x[k]];
		}
		const p = this.model.lcnn.predict(tf.tensor2d(y, [1, this.width.lcnn]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(Math.fround(p.dataSync()[1]));
	}
	private qPCNN(x: string): number {
		const y: Int32Array = new Int32Array(this.width.pcnn).fill(1);
		for(let k = this.pseudosyllables.length-1; k >= 0; k--){
			if((x.split(this.pseudosyllables[k]).length-1) === 0){
				y[k] = 0;
			}
		}
		const p = this.model.pcnn.predict(tf.tensor2d(y, [1, this.width.pcnn]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(Math.fround(p.dataSync()[1]));
	}
	constructor(){
		for(let k = this.pseudosyllables.length-1; k >= 0; k--){
			this.pseudosyllables[k] = new RegExp(this.pseudosyllables[k]);
		}
	}
	public async queryECNN(x: Array<string>): Promise<number> {
		if(this.loaded.ecnn === true){
			return(this.qECNN(x));
		} else if(await this.reCheck(60000, 'ecnn') === true){
			return(this.qECNN(x));
		} else {
			console.error('Could not load ecnn after 60 seconds!');
			return(0);
		}
	}
	public async queryEDFFNN(x: Float32Array): Promise<number> {
		if(this.loaded.edffnn === true){
			return(this.qEDFFNN(x));
		} else if(await this.reCheck(60000, 'edffnn') === true){
			return(this.qEDFFNN(x));
		} else {
			console.error('Could not load edffnn after 60 seconds!');
			return(0);
		}
	}
	public async queryLCNN(x: Array<string>): Promise<number> {
		if(this.loaded.lcnn === true){
			return(this.qLCNN(x));
		} else if(await this.reCheck(60000, 'lcnn') === true){
			return(this.qLCNN(x));
		} else {
			console.error('Could not load lcnn after 60 seconds!');
			return(0);
		}
	}
	public async queryPCNN(x: string): Promise<number> {
		if(this.loaded.pcnn === true){
			return(this.qPCNN(x));
		} else if(await this.reCheck(60000, 'pcnn') === true){
			return(this.qPCNN(x));
		} else {
			console.error('Could not load pcnn after 60 seconds!');
			return(0);
		}
	}
	private async reCheck(ms: number, m: 'ecnn'|'edffnn'|'lcnn'|'pcnn'): Promise<boolean> {
		if(await this.timeout(10, m) === true){
			return(true);
		} else if((ms-10) < 0){
			return(false);
		} else {
			return(this.reCheck(ms-10, m));
		}
	}
	private timeout(ms: number, m: 'ecnn'|'edffnn'|'lcnn'|'pcnn'): Promise<boolean> {
		return(new Promise(resolve => setTimeout(resolve, ms, this.loaded[m])));
	}
}
