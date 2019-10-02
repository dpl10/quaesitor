/* imports from node_modules */
import { InferenceModel } from '@tensorflow/tfjs';
/* imports from module */
export class Properties {
	[key: string]: InferenceModel|boolean|number|string;
	inputInt: boolean;
	inputLayer: string;
	json?: any;
	loaded: boolean;
	model?: InferenceModel|any;
	network: boolean;
	width: number;
}
export class Model {
	[key: string]: Properties;
	protected static SInit = (() => {
		Model.prototype.bf = {
			inputInt: false,
			inputLayer: '',
			loaded: false,
			network: false,
			width: 0,
		};
		Model.prototype.ecnn = {
			inputInt: false,
			inputLayer: 'reshape_1d',
			loaded: false,
			network: true,
			width: 464,
		};
		Model.prototype.lcnn = {
			inputInt: true,
			inputLayer: 'embedding',
			loaded: false,
			network: true,
			width: 58,
		};
		Model.prototype.pdffnn = {
			inputInt: true,
			inputLayer: 'dense',
			loaded: false,
			network: true,
			width: 64,
		};
	})();
	bf: Properties;
	ecnn: Properties;
	lcnn: Properties;
	pdffnn: Properties;
}
export type ModelKey = 'bf'|'ecnn'|'lcnn'|'pdffnn';
export class Classifiers {
	[key: string]: any;
	bf: ArrayBuffer;
	ecnn: any;
	lcnn: any;
	pdffnn: any;
}
