/* imports from node_modules */
const LRUCache = require('mnemonist/lru-cache'); /* an import statement causes problems */
import * as tf from '@tensorflow/tfjs-node'; /* changed to tfjs post build for online version */
import { InferenceModel, Tensor } from '@tensorflow/tfjs'; /* type definitions only, so source doesnt matter for speed */
import { LTTB, XYDataPoint } from 'downsample';
/* imports from module */
import { BloomFilter } from './bloom-filter';
import { c2i, injectivePhones, phones } from './encoder';
import { Flatten } from './flatten';
import { Model, ModelKey } from './model';
import { pseudosyllables } from './pseudosyllables';
import { RegularExpression } from './regular-expression';
/* imports from assets */
const classifiers = new Model();
// @ts-ignore esbuild LOADER fixes this
import b from './assets/bedffnn.json';
classifiers.bedffnn.json = b;
// @ts-ignore esbuild LOADER fixes this
import e from './assets/ecnn.json';
classifiers.ecnn.json = e;
// @ts-ignore esbuild LOADER fixes this
import l from './assets/lcnn.json';
classifiers.lcnn.json = l;
// @ts-ignore esbuild LOADER fixes this
import p from './assets/pdffnn.json';
classifiers.pdffnn.json = p;
// @ts-ignore esbuild LOADER fixes this
import u from './assets/uedffnn.json';
classifiers.uedffnn.json = u;
// @ts-ignore esbuild LOADER fixes this
import B from './assets/bedffnn.pbf';
classifiers.bedffnn.rawModel = B;
// @ts-ignore esbuild LOADER fixes this
import E from './assets/ecnn.pbf';
classifiers.ecnn.rawModel = E;
// @ts-ignore esbuild LOADER fixes this
import L from './assets/lcnn.pbf';
classifiers.lcnn.rawModel = L;
// @ts-ignore esbuild LOADER fixes this
import P from './assets/pdffnn.pbf';
classifiers.pdffnn.rawModel = P;
// @ts-ignore esbuild LOADER fixes this
import U from './assets/uedffnn.pbf';
classifiers.uedffnn.rawModel = U;
// @ts-ignore esbuild LOADER fixes this
import F from './assets/bf.pbf';
classifiers.bf.rawModel = F;
/* speed (maybe) */
tf.enableProdMode();
export class Classifier {
	private bf: BloomFilter = new BloomFilter();
	private flatten: Flatten = new Flatten();
	private model: Model = new Model();
	private queryCache = new LRUCache(8192); /* LRUCache<string, Float32Array> */
	private regularExpression: RegularExpression = new RegularExpression();
	public async load(): Promise<void> {
		for(const m in this.model){
			if((m === 'bedffnn') || (m === 'ecnn') || (m === 'lcnn') || (m === 'pdffnn') || (m === 'uedffnn')){
				this.model[m].model = await tf.loadLayersModel({
					load: async () => {
						return({
							convertedBy: classifiers[m].json.convertedBy,
							format: classifiers[m].json.format,
							generatedBy: classifiers[m].json.generatedBy,
							modelTopology: classifiers[m].json.modelTopology,
							userDefinedMetadata: classifiers[m].json.userDefinedMetadata,
							weightData: classifiers[m].rawModel.buffer.slice(classifiers[m].rawModel.byteOffset, classifiers[m].rawModel.byteLength+classifiers[m].rawModel.byteOffset), /* thank you Stéphane (https://stackoverflow.com/a/54646864) */
							weightSpecs: classifiers[m].json.weightsManifest[0].weights
						});
					}
				}) as InferenceModel;
				// @ts-ignore: InferenceModel has getLayer... really
				this.model[m].width = this.model[m].model.getLayer('inputLayer').batchInputShape[1];
				const y = this.model[m].inputInt ? new Int32Array(this.model[m].width).fill(0) : new Float32Array(this.model[m].width).fill(0);
				const p = this.model[m].model.predict(tf.tensor2d(y, [1, this.model[m].width]), {
					batchSize: 1,
					verbose: false
				}) as Tensor;
				if(p.dataSync()[1] > 0){ /* if it is not primed, it will not work... wft */
					this.model[m].loaded = true;
				}
			} else if(m === 'bf'){
				this.model.bf.loaded = this.bf.load(classifiers.bf.rawModel, 0);
			}
		}
		this.model.kluge.loaded = this.bf.loadArray(new Uint32Array([1283416317, 3387457439, 4209112991, 3520002074, 1144686426, 3155412713, 3592297154, 308830083, 1130612061, 730418870, 1038915210, 3374557547, 3720788671, 2190049136, 1618358991, 1168865259, 752622717, 545310520, 1130253422, 1209003497, 987597691, 1459847669, 3070958455, 529761981, 1228838247, 978740476, 2520715720, 1415304893, 4070213315, 121028745, 4110337836, 712147284, 1337470519, 1111897967, 3023169381, 650969950, 392970344, 1894424605, 1584273708, 3829791236, 1775660966, 1325403779, 3364746613, 143827330, 2522860555, 278220957, 37677879, 1754752414, 175190658, 3604261002, 3121375234, 621027444, 1679379711, 3857678238, 3962210137, 1385103514, 3995533402, 4013474193, 3302042558, 4216881175]), 20, 1920, 1);
	}
	private async qBEDFFNN(x: Float32Array, y: Float32Array): Promise<boolean> {
		const z: Float32Array = new Float32Array(this.model.bedffnn.width);
		z[0] = x[0]*y[0];
		z[1] = x[1]*y[1];
		z[2] = x[2]*y[2];
		z[3] = x[3]*y[3];
		z[4] = (x[4]+y[4])/2;
		const p = this.model.bedffnn.model.predict(tf.tensor2d(z, [1, this.model.bedffnn.width]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		if(p.dataSync()[1] < 0.99){
			return(false);
		} else {
			return(true);
		}
	}
	private async qBF(x: string): Promise<number> {
		return(this.bf.query(x, 0));
	}
	private qECNN(x: Array<string>): number { /* based on the Eudex hash (https://github.com/ticki/eudex) */
		const y: Float32Array = new Float32Array(this.model.ecnn.width);
		const l: number = x.length;
		const w = this.model.ecnn.width/7;
		if(l === w){ /* exact width */
			for(let k = 6; k >= 0; k--){
				const i: number = w*k;
				y[i] = injectivePhones[k][x[0]];
				for(let j = l-1; j > 0; j--){
					y[i+j] = phones[k][x[j]];
				}
			}
		} else if(l > w){ /* downsample with largest triangle three buckets (LTTB; https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) */
			for(let k = 6; k >= 0; k--){
				const d: Array<XYDataPoint> = [];
				d[0] = {
					x: 1,
					y: injectivePhones[k][x[0]]
				};
				for(let j = l-1; j > 0; j--){
					d[j] = {
						x: j+1,
						y: phones[k][x[j]]
					};
				}
				const o: Array<XYDataPoint> = LTTB(d, w) as Array<XYDataPoint>;
				const i: number = w*k;
				for(let j = o.length-1; j >= 0; j--){
					y[i+j] = o[j].y;
				}
			}
		} else { /* upsample with linear interpolation */
			const d: number = l/w;
			for(let k = 6; k >= 0; k--){
				const i: number = w*k;
				for(let j = w-1; j >= 0; j--){
					const jx: number = j*d;
					const ji: number = Math.trunc(jx);
					const jn: number = ji+1;
					let s0: number;
					if(ji === 0){
						s0 = injectivePhones[k][x[0]];
					} else {
						s0 = phones[k][x[ji]];
					}
					let s1: number;
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
		const p = this.model.ecnn.model.predict(tf.tensor2d(y, [1, this.model.ecnn.width]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(p.dataSync()[1]);
	}
	private async qKLUGE(x: string): Promise<number> {
		return(this.bf.query(x, 1));
	}
	private qLCNN(x: Array<string>): number {
		const y: Int32Array = new Int32Array(this.model.lcnn.width).fill(0);
		let l: number = x.length;
		if(l > this.model.lcnn.width){
			l = this.model.lcnn.width;
		}
		for(let k = l-1; k >= 0; k--){
			y[k] = c2i[x[k]];
		}
		const p = this.model.lcnn.model.predict(tf.tensor2d(y, [1, this.model.lcnn.width]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(p.dataSync()[1]);
	}
	private qPDFFNN(x: string): number {
		const y: Int32Array = new Int32Array(pseudosyllables.length).fill(0);
		for(let k = pseudosyllables.length-1; k >= 0; k--){
			for(let j = pseudosyllables[k].length-1; j >= 0; j--){
				y[k] = y[k] << 1;
				if((x.split(pseudosyllables[k][j]).length-1) > 0){
					y[k] = y[k] | 1;
				}
			}
		}
		const p = this.model.pdffnn.model.predict(tf.tensor2d(y, [1, this.model.pdffnn.width]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(p.dataSync()[1]);
	}
	private async qUEDFFNN(x: Float32Array): Promise<boolean> {
		const p = this.model.uedffnn.model.predict(tf.tensor2d(x, [1, this.model.uedffnn.width]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		if(p.dataSync()[1] < 0.98){
			return(false);
		} else {
			return(true);
		}
	}
	constructor(){
	}
	public async queryBEDFFNN(x: Float32Array, y: Float32Array): Promise<boolean> {
		if(this.model.bedffnn.loaded === true){
			return(this.qBEDFFNN(x, y));
		} else if(await this.reCheck(60000, 'bedffnn') === true){
			return(this.qBEDFFNN(x, y));
		} else {
			console.error('Could not load bedffnn after 60 seconds!');
			return(false);
		}
	}
	private async queryBF(x: string): Promise<number> {
		if(this.model.bf.loaded === true){
			return(this.qBF(x));
		} else if(await this.reCheck(60000, 'bf') === true){
			return(this.qBF(x));
		} else {
			console.error('Could not load bf after 60 seconds!');
			return(0);
		}
	}
	private async queryECNN(x: Array<string>): Promise<number> {
		if(this.model.ecnn.loaded === true){
			return(this.qECNN(x));
		} else if(await this.reCheck(60000, 'ecnn') === true){
			return(this.qECNN(x));
		} else {
			console.error('Could not load ecnn after 60 seconds!');
			return(0);
		}
	}
	public async queryEnsemble(x: string): Promise<Float32Array> {
		const y: string = this.flatten.squash(x).replace(this.regularExpression.antiASCIIlowerCase, ' ').replace(this.regularExpression.leadingSpace, '').replace(this.regularExpression.trailingSpace, '');
		const q: Float32Array = new Float32Array(this.model.uedffnn.width).fill(0);
		if(this.queryCache.has(y) === true){
			return(this.queryCache.get(y) as Float32Array);
		} else if(await this.queryKLUGE(y) === 1){
			this.queryCache.set(y, q);
			return(q);
		} else {
			const z: Array<string> = y.split('');
			q[0] = await this.queryBF(y);
			q[1] = await this.queryECNN(z);
			q[2] = await this.queryLCNN(z);
			q[3] = await this.queryPDFFNN(y);
			q[4] = y.length/58; /* should be this.model.lcnn.width, but may not be loaded yet, so hardcoded here */
			this.queryCache.set(x, q);
			return(q);
		}
	}
	public async queryKLUGE(x: string): Promise<number> {
		if(this.model.kluge.loaded === true){
			return(this.qKLUGE(x));
		} else if(await this.reCheck(60000, 'kluge') === true){
			return(this.qKLUGE(x));
		} else {
			console.error('Could not load kluge after 60 seconds!');
			return(0);
		}
	}
	private async queryLCNN(x: Array<string>): Promise<number> {
		if(this.model.lcnn.loaded === true){
			return(this.qLCNN(x));
		} else if(await this.reCheck(60000, 'lcnn') === true){
			return(this.qLCNN(x));
		} else {
			console.error('Could not load lcnn after 60 seconds!');
			return(0);
		}
	}
	private async queryPDFFNN(x: string): Promise<number> {
		if(this.model.pdffnn.loaded === true){
			return(this.qPDFFNN(x));
		} else if(await this.reCheck(60000, 'pdffnn') === true){
			return(this.qPDFFNN(x));
		} else {
			console.error('Could not load pdffnn after 60 seconds!');
			return(0);
		}
	}
	public async queryUEDFFNN(x: Float32Array): Promise<boolean> {
		if(this.model.uedffnn.loaded === true){
			return(this.qUEDFFNN(x));
		} else if(await this.reCheck(60000, 'uedffnn') === true){
			return(this.qUEDFFNN(x));
		} else {
			console.error('Could not load uedffnn after 60 seconds!');
			return(false);
		}
	}
	private async reCheck(ms: number, m: ModelKey): Promise<boolean> {
		if(await this.timeout(10, m) === true){
			return(true);
		} else if((ms-10) < 0){
			return(false);
		} else {
			return(this.reCheck(ms-10, m));
		}
	}
	private timeout(ms: number, m: ModelKey): Promise<boolean> {
		return(new Promise(resolve => setTimeout(resolve, ms, this.model[m].loaded)));
	}
}
