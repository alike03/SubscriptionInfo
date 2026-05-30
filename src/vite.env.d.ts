/// <reference types="vite/client" />

declare module '*.svelte' {
	import type { SvelteComponent } from 'svelte';

	export default class Component<
		Props extends Record<string, any> = any,
		Events extends Record<string, any> = any,
		Slots extends Record<string, any> = any,
	> extends SvelteComponent<Props, Events, Slots> {}
}
