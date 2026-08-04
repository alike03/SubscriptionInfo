/**
 * Packages the source archive that Mozilla Add-ons requires for reviewing versions
 * containing bundled/minified code (see SOURCE.md).
 *
 * Usage: bun run build:source [ref]
 *
 * `ref` is any git revision, default HEAD - use a tag (e.g. v3.0.1) to build the archive
 * for an already released version. The archive is created with `git archive`, so it holds
 * exactly the committed sources with LF line endings regardless of the local
 * core.autocrlf setting, which keeps the reviewer's build byte-identical to ours.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';

function git(args: string[]) {
	return spawnSync('git', args, { encoding: 'utf8' });
}

const ref = process.argv[2] || 'HEAD';

if (git(['rev-parse', '--verify', ref]).status !== 0) {
	console.error(`Unknown git revision: ${ref}`);
	process.exit(1);
}

const status = git(['status', '--porcelain']);
if (status.status !== 0) {
	console.error('Failed to read git status.');
	process.exit(1);
}
if (status.stdout.trim()) {
	console.warn('Warning: uncommitted changes are not included in the source archive.');
}

const { version } = JSON.parse(
	readFileSync(new URL('../package.json', import.meta.url), 'utf8')
) as { version: string };

const output = `_info/v${version}-source.zip`;

// SOURCE.md is added from the working tree when the revision predates it, so archives for
// older tags also carry the build instructions. Adding it twice would duplicate the entry.
const hasSourceMd = git(['cat-file', '-e', `${ref}:SOURCE.md`]).status === 0;

mkdirSync('_info', { recursive: true });

const archive = spawnSync(
	'git',
	[
		'-c',
		'core.autocrlf=false',
		'archive',
		'--format=zip',
		'-9',
		...(hasSourceMd ? [] : ['--add-file=SOURCE.md']),
		'-o',
		output,
		ref,
	],
	{ stdio: 'inherit' }
);

if (archive.status !== 0) {
	process.exit(archive.status ?? 1);
}

console.log(`Source archive written to ${output} (from ${ref}).`);
