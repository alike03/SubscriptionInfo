import { mkdir } from 'node:fs/promises';
import tailwindcss from '@tailwindcss/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import { defineConfig, PluginOption } from 'vite';
import webExtension, { readJsonFile } from 'vite-plugin-web-extension';
import { COMPRESSION_LEVEL, zip } from 'zip-a-folder';

const target = process.env.TARGET || 'chrome';
const webExtTarget = target === 'firefox' ? 'firefox-desktop' : 'chromium';

function generateManifest() {
	const manifest = readJsonFile('src/manifest.json');
	const pkg = readJsonFile('package.json');
	return {
		...manifest,
		description: pkg.description,
		version: pkg.version,
	};
}

function packageExtension(): PluginOption {
	let isProductionBuild = false;

	return {
		name: 'package-extension',
		apply: 'build',
		configResolved(config) {
			isProductionBuild = config.mode === 'production';
		},
		writeBundle: {
			sequential: true,
			async handler() {
				if (!isProductionBuild) {
					return;
				}

				const manifest = readJsonFile('package.json');
				await mkdir('_info', { recursive: true });

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
	server: {
		port: 5173,
		strictPort: true,
	},
	resolve: {
		alias: {
			$lib: resolve(__dirname, './src/page/lib')
		}
	},
	plugins: [
		svelte(),
		tailwindcss(),
		webExtension({
			manifest: generateManifest,
			watchFilePaths: ['package.json', 'src/manifest.json'],
			htmlViteConfig: {
				server: {
					port: 5173,
					strictPort: true,
				},
			},
			scriptViteConfig: {
				server: {
					port: 5173,
					strictPort: true,
				},
			},
			webExtConfig: {
				target: webExtTarget,
				startUrl: 'https://store.steampowered.com/app/1551360/Forza_Horizon_5',
				args: ['--window-size=400x300'],
			},
			browser: target,
		}),
		packageExtension(),
	],
});
