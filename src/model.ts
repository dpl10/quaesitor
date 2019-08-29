/* imports from node_modules */
import { InferenceModel } from '@tensorflow/tfjs';
export class Model {
	[key: string]: InferenceModel|any;
	ecnn: InferenceModel|any;
	edffnn: InferenceModel|any;
	lcnn: InferenceModel|any;
	pcnn: InferenceModel|any;
}
export class ModelLoaded {
	[key: string]: boolean;
	protected static SInit = (() => {
		ModelLoaded.prototype.ecnn = false;
		ModelLoaded.prototype.edffnn = false;
		ModelLoaded.prototype.lcnn = false;
		ModelLoaded.prototype.pcnn = false;
	})();
	ecnn: boolean;
	edffnn: boolean;
	lcnn: boolean;
	pcnn: boolean;
}
export class ModelTypeDeep {
	[key: string]: boolean;
	protected static SInit = (() => {
		ModelTypeDeep.prototype.ecnn = false;
		ModelTypeDeep.prototype.edffnn = true;
		ModelTypeDeep.prototype.lcnn = false;
		ModelTypeDeep.prototype.pcnn = false;
	})();
	ecnn: boolean;
	edffnn: boolean;
	lcnn: boolean;
	pcnn: boolean;
}
export class ModelWidth {
	[key: string]: number;
	protected static SInit = (() => {
		ModelWidth.prototype.ecnn = 464;
		ModelWidth.prototype.edffnn = 3;
		ModelWidth.prototype.lcnn = 58;
		ModelWidth.prototype.pcnn = 1097;
	})();
	ecnn: number;
	edffnn: number;
	lcnn: number;
	pcnn: number;
}
