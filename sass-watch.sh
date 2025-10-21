#!/usr/bin/env bash
# Watch SCSS and compile to CSS using Dart Sass
# Usage:
#   ./sass-watch.sh                # watches src/style.scss -> src/style.css
#   ./sass-watch.sh input:output   # watches custom input:output pair

set -euo pipefail

DEFAULT_PAIR="src/style.scss:src/style.css"
PAIR=${1:-$DEFAULT_PAIR}

command -v sass >/dev/null 2>&1 || {
	echo "Error: 'sass' command not found."
	echo "Install Sass with NPM: npm install -g sass"
	echo "Or on Windows: choco install sass"
	echo "Or on macOS: brew install sass/sass/sass"
	exit 2
}

sass --watch --no-source-map --style=compressed "$PAIR"
