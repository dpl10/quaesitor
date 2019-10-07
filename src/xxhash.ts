/* imports from node_modules */
//#ifdef NODE
const xxhash = require('xxhash-wasm/cjs/xxhash-wasm'); /* an import statement causes problems */
//#else
const xxhash = require('xxhash-wasm/umd/xxhash-wasm'); /* an import statement causes problems */
//#endif
interface XXhashType {
	h32: Function;
	h64: Function;
}
export class XXhash {
	private loaded: boolean = false;
	private xxh64: Function;
	constructor(){
		this.load();
	}
	public async h64(x: string): Promise<string> {
		if(this.loaded === true){
			return(this.xxh64(x));
		} else if(await this.reCheck(10000) === true){
			return(this.xxh64(x));
		} else {
			console.error('Could not load xxhash-wasm after 10 seconds!');
			return('');
		}
	}
	private load(): void {
		xxhash().then((x: XXhashType): void => {
			this.xxh64 = x.h64;
			this.loaded = true;
		});
	}
	private async reCheck(ms: number): Promise<boolean> {
		if(await this.timeout(10) === true){
			return(true);
		} else if((ms-10) < 0){
			return(false);
		} else {
			return(this.reCheck(ms-10));
		}
	}
	private timeout(ms: number): Promise<boolean> {
		return(new Promise(resolve => setTimeout(resolve, ms, this.loaded)));
	}
}
