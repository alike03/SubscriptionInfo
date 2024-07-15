import { defineConfig, PluginOption } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import webExtension, { readJsonFile } from "vite-plugin-web-extension";
import { COMPRESSION_LEVEL, zip } from 'zip-a-folder';

function generateManifest() {
	const manifest = readJsonFile("src/manifest.json");
	const pkg = readJsonFile("package.json");
	return {
		...manifest,
		description: pkg.description,
		version: pkg.version,
	};
}

function packageExtension(): PluginOption {
	return {
		name: "package-extension",
		apply: "build",
		writeBundle: {
			sequential: true,
			async handler() {
				const manifest = readJsonFile("package.json");
				const target = process.env.TARGET || "chrome";

				await zip(
					'dist',
					`_info/v${manifest.version}-${target}.zip`,
					{compression: COMPRESSION_LEVEL.high}
				);
			}
		}
	}
}

export default defineConfig({
	plugins: [
		svelte(),
		webExtension({
			manifest: generateManifest,
			watchFilePaths: ["package.json", "manifest.json"],
			webExtConfig: {
				startUrl: 'https://store.steampowered.com/app/1551360/Forza_Horizon_5',
				args: ["--window-size=400x300"],
			},
			browser: process.env.TARGET || "chrome",
		}),
		packageExtension(),
	],
});
