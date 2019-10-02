/* imports from node_modules */
const LRUCache = require('mnemonist/lru-cache'); /* an import statement causes problems */
import { Tensor } from '@tensorflow/tfjs';
//#ifdef NODE
import * as tf from '@tensorflow/tfjs-node';
//#else
import * as tf from '@tensorflow/tfjs';
//#endif
/* imports from module */
import { BloomFilter } from './bloom-filter';
import { Classifiers, Model, ModelKey } from './model';
import { Flatten } from './flatten';
import { c2i, injectivePhones, phones } from './encoder';
import { pseudosyllables } from './pseudosyllables';
/* imports from (webpacked) assets */
const modelJSON = new Model();
modelJSON.ecnn.json = require('./assets/ecnn.json');
modelJSON.lcnn.json = require('./assets/lcnn.json');
modelJSON.pdffnn.json = require('./assets/pdffnn.json');
export class Classifier {
	private bf: BloomFilter = new BloomFilter();
	private flatten: Flatten = new Flatten();
	private model: Model = new Model();
	private queryCache = new LRUCache(8192); /* LRUCache<string, Array<number>> */
	public async load(x: Classifiers): Promise<void> {
		for(const m in this.model){
			if((m === 'ecnn') || (m === 'lcnn') || (m === 'pdffnn')){
				this.model[m].model = await tf.loadLayersModel({
					load: async () => {
						return({
							convertedBy: modelJSON[m].json.convertedBy,
							format: modelJSON[m].json.format,
							generatedBy: modelJSON[m].json.generatedBy,
							modelTopology: modelJSON[m].json.modelTopology,
							userDefinedMetadata: modelJSON[m].json.userDefinedMetadata,
							weightData: x[m].buffer.slice(x[m].byteOffset, x[m].byteLength+x[m].byteOffset), /* thank you Stéphane (https://stackoverflow.com/a/54646864) */
							weightSpecs: modelJSON[m].json.weightsManifest[0].weights
						});
					}
				});
				this.model[m].width = this.model[m].model.getLayer(this.model[m].inputLayer).batchInputShape[1];
				const y = this.model[m].inputInt ? new Int32Array(this.model[m].width).fill(0) : new Float32Array(this.model[m].width).fill(0);
				const p = this.model[m].model.predict(tf.tensor2d(y, [1, this.model[m].width]), {
					batchSize: 1,
					verbose: false
				}) as Tensor;
				if(p.dataSync()[1] > 0){ /* if it is not primed, it will not work... wft */
					this.model[m].loaded = true;
				}
			} else if(m === 'bf'){
				this.model.bf.loaded = this.bf.load(x.bf);
			}
		}
	}
	private async qBF(x: string): Promise<number> {
		return(this.bf.query(x));
	}
	private qECNN(x: Array<string>): number { /* based on the Eudex hash (https://github.com/ticki/eudex) */
		const y: Float32Array = new Float32Array(this.model.ecnn.width);
		let l: number = x.length;
		const w = this.model.ecnn.width/8;
		if(l > w){
			l = w;
		}
		for(let k = 7; k >= 0; k--){
			const i = w*k;
			y[i] = injectivePhones[k][x[0]];
			for(let j = l-1; j > 0; j--){
				y[i+j] = phones[k][x[j]];
			}
			for(let j = l; j < w; j++){
				y[i+j] = phones[k][' '];
			}
		}
		const p = this.model.ecnn.model.predict(tf.tensor2d(y, [1, this.model.ecnn.width]), {
			batchSize: 1,
			verbose: false
		}) as Tensor;
		return(p.dataSync()[1]);
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
	constructor(){
	}
	public queryBELDA(x: Array<number>, y: Array<number>): boolean {
		if((-18.123106+(1.764249*x[0]*y[0])+(33.719165*x[1]*y[1])+(23.093116*x[2]*y[2])+(19.615873*x[3]*y[3])) > 3.1669452){
			return(true);
		} else {
			return(false);
		}
	}
	public async queryBF(x: string): Promise<number> {
		if(this.model.bf.loaded === true){
			return(this.qBF(x));
		} else if(await this.reCheck(60000, 'bf') === true){
			return(this.qBF(x));
		} else {
			console.error('Could not load bf after 60 seconds!');
			return(0);
		}
	}
	public async queryECNN(x: Array<string>): Promise<number> {
		if(this.model.ecnn.loaded === true){
			return(this.qECNN(x));
		} else if(await this.reCheck(60000, 'ecnn') === true){
			return(this.qECNN(x));
		} else {
			console.error('Could not load ecnn after 60 seconds!');
			return(0);
		}
	}
	public async queryEnsemble(x: string): Promise<Array<number>> {
		if(this.queryCache.has(x) === true){
			return(this.queryCache.get(x));
		} else {
			const q: Array<number> = [0, 0, 0, 0];
			const y: string = this.flatten.squash(x).replace(/[^a-z]/g, ' ').replace(/^ +/, '');
			const z: Array<string> = y.split('');
			q[0] = await this.queryECNN(z);
			q[1] = await this.queryLCNN(z);
			q[2] = await this.queryPDFFNN(y);
			q[3] = await this.queryBF(y);
			this.queryCache.set(x, q);
			return(q);
		}
	}
	public async queryLCNN(x: Array<string>): Promise<number> {
		if(this.model.lcnn.loaded === true){
			return(this.qLCNN(x));
		} else if(await this.reCheck(60000, 'lcnn') === true){
			return(this.qLCNN(x));
		} else {
			console.error('Could not load lcnn after 60 seconds!');
			return(0);
		}
	}
	public async queryPDFFNN(x: string): Promise<number> {
		if(this.model.pdffnn.loaded === true){
			return(this.qPDFFNN(x));
		} else if(await this.reCheck(60000, 'pdffnn') === true){
			return(this.qPDFFNN(x));
		} else {
			console.error('Could not load pdffnn after 60 seconds!');
			return(0);
		}
	}
	public queryUELDA(x: Array<number>): boolean {
		if((-19.778721+(1.197387*x[0])+(29.586485*x[1])+(14.965796*x[2])+(14.415414*x[3])) > 2.929285342){
			return(true);
		} else {
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
