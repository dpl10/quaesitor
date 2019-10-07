//#ifdef NODE
declare module 'xxhash-wasm/cjs/xxhash-wasm';
//#else
declare module 'xxhash-wasm/umd/xxhash-wasm' {
	export function xxhash(): Function;
}
//#endif