# Source Code and Build Instructions

This archive contains the complete original source code of the browser extension
**alike03's Subscription Info on Steam**.

The submitted package contains machine-generated code: the sources are compiled by the
Svelte and Tailwind CSS compilers and bundled and minified by Vite (esbuild) through
`vite-plugin-web-extension`. Nothing in the submitted package is written by hand in the
form in which it ships.

The version this archive belongs to is the `version` field in `package.json`. It is
injected into `src/manifest.json` (placeholder `{{version}}`) at build time by
`vite.config.ts`.

## Build environment

| Requirement | Details |
| --- | --- |
| Tool | [Bun](https://bun.sh) 1.3.3 (MIT licensed, open source, runs locally) |
| Node.js / npm | Not required for the build. npm is only a convenient way to install Bun. |
| OS | Any OS supported by Bun. Verified on Ubuntu (GitHub Actions runner) and Windows 11. |
| Network | Only the public npm registry, during dependency installation. |

Bun is the only deviation from the default reviewer environment (Ubuntu 24.04 with
Node.js and npm). Install it with the npm that is already present:

```sh
npm install -g bun@1.3.3
```

Alternatively, with the official installer:

```sh
curl -fsSL https://bun.sh/install | bash -s "bun-v1.3.3"
```

Check the result:

```sh
bun --version   # 1.3.3
```

Bun is used as package manager and script runner only. The actual compiling, bundling and
minifying is done by the Vite, Svelte, esbuild and Tailwind CSS versions pinned in
`bun.lockb`, so a newer Bun release does not change the build output.

## Build steps

Run both commands in the directory that contains this file:

```sh
bun install --frozen-lockfile
bun run build:firefox
```

`--frozen-lockfile` makes the install fail instead of resolving different dependency
versions than the ones recorded in `bun.lockb`.

Bun reports two blocked `postinstall` scripts (`svelte-preprocess`, which only prints a
message, and `spawn-sync`, a legacy shim). The build does not need them; they can stay
blocked.

The build produces:

- `dist/` — the unpacked extension. Its contents are identical to the contents of the
  submitted XPI.
- `_info/v<version>-firefox.zip` — the same directory zipped. This is the file submitted
  to Mozilla Add-ons.

The Chromium build (Chrome, Edge) is produced by `bun run build:chrome`; it is not part of
this submission. The only difference between the two targets is the manifest, which is
generated from `src/manifest.json` (see the `{{firefox}}` / `{{chrome}}` prefixes there).

## Verifying the result

The build is deterministic: identical sources plus `bun.lockb` produce byte-identical
output. Zip files store modification timestamps, so compare the extracted files instead of
the archives:

```sh
mkdir -p submitted && (cd submitted && unzip -oq /path/to/submitted.xpi)
(cd dist && find . -type f | sort | xargs sha256sum) > built.txt
(cd submitted && find . -type f | sort | xargs sha256sum) > submitted.txt
diff built.txt submitted.txt   # no output = identical
```

Line endings in this archive are LF, exactly as stored in the repository. Building from a
checkout with CRLF line endings changes `src/popup/popup.html` in the output, because that
file is copied into the bundle as-is.

## Dependencies

All dependencies are installed from the public npm registry and pinned by `bun.lockb`;
none of them are vendored into this archive, and no dependency is downloaded from any
other source. To list the resolved versions after installing:

```sh
bun pm ls --all
```

`bunfig.toml` sets `minimumReleaseAge`, a supply-chain safeguard that ignores very
recently published package versions. It only affects fresh dependency resolution and has
no effect on `bun install --frozen-lockfile`.

## Contents of this archive

| Path | Purpose |
| --- | --- |
| `src/manifest.json` | Manifest V3 source template, shared by both browser targets |
| `src/page/content/` | Steam page integration and the injected subscription badges |
| `src/page/background/` | Background script / service worker |
| `src/page/lib/` | API client, storage, cache, platform metadata, i18n, shared components |
| `src/popup/` | Toolbar popup UI |
| `public/` | Extension icons, copied into the build unchanged |
| `vite.config.ts`, `svelte.config.js`, `tsconfig*.json` | Build configuration |
| `package.json`, `bun.lockb`, `bunfig.toml` | Dependency manifests and lockfile |
| `README.md` | General project documentation |

The archive contains no generated files. `dist/` (build output), `_info/` (packaged zips)
and `node_modules/` (installed dependencies) are excluded, since the steps above recreate
them.

## Public repository

The sources are also public at <https://github.com/alike03/SubscriptionInfo>. The tag
`v<version>` corresponds to this archive; this file may be added on top of the tagged
tree, which does not affect the build output.
