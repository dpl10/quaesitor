/* imports from node_modules */
//#ifdef NODE
import { InferenceModel } from '@tensorflow/tfjs-node';
//#else
import { InferenceModel } from '@tensorflow/tfjs';
//#endif
export class Properties {
	[key: string]: InferenceModel|boolean|number|string;
	inputInt: boolean;
	json?: any;
	loaded: boolean;
	model?: InferenceModel|any;
	network: boolean;
	width: number;
}
export class Model {
	[key: string]: Properties;
	protected static SInit = (() => {
		Model.prototype.bedffnn = {
			inputInt: false,
			loaded: false,
			network: true,
			width: 5,
		};
		Model.prototype.bf = {
			inputInt: false,
			loaded: false,
			network: false,
			width: 0,
		};
		Model.prototype.ecnn = {
			inputInt: false,
			loaded: false,
			network: true,
			width: 112,
		};
		Model.prototype.kluge = {
			inputInt: false,
			loaded: false,
			network: false,
			width: 0,
		};
		Model.prototype.lcnn = {
			inputInt: true,
			loaded: false,
			network: true,
			width: 58,
		};
		Model.prototype.pdffnn = {
			inputInt: true,
			loaded: false,
			network: true,
			width: 64,
		};
		Model.prototype.uedffnn = {
			inputInt: false,
			loaded: false,
			network: true,
			width: 5,
		};
	})();
	bedffnn: Properties;
	bf: Properties;
	ecnn: Properties;
	kluge: Properties;
	lcnn: Properties;
	pdffnn: Properties;
	uedffnn: Properties;
}
export type ModelKey = 'bedffnn'|'bf'|'ecnn'|'kluge'|'lcnn'|'pdffnn'|'uedffnn';
export class Classifiers {
	[key: string]: any;
	bedffnn: any;
	bf: ArrayBuffer;
	ecnn: any;
	kluge?: Uint32Array;
	lcnn: any;
	pdffnn: any;
	uedffnn: any;
}
