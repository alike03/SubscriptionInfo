import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";

function generateManifest() {
	const manifest = readJsonFile("src/manifest.json");
	const pkg = readJsonFile("package.json");
	console.log(pkg);
	return {
		...manifest,
		name: pkg.name,
		description: pkg.description,
		version: pkg.version,
	};
}

export default defineConfig({
	plugins: [
		svelte(),
		webExtension({
			manifest: generateManifest,
			watchFilePaths: ["package.json", "manifest.json"],
			webExtConfig: {
				startUrl: 'https://store.steampowered.com/app/1551360/Forza_Horizon_5',
			},
		}),
	],
});
