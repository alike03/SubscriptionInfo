/// <reference types="vite/client" />

declare module '*.svelte' {
	export { SvelteComponent as default } from 'svelte';
}

declare module '*.scss' {
	const stylesheet: string;
	export default stylesheet;
}
