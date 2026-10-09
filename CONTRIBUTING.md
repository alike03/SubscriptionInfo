# Contributing

Thanks for helping out. Wrong or missing subscription data is easiest to report from the extension itself: every game badge has a "Report a problem" action. Language requests and votes go to <https://sub.aligueler.com/language>.

## Setup

```sh
bun install
bun run dev:chrome   # or dev:firefox
bun run check        # typecheck, must pass
bun run build        # builds both browsers into dist/
bun run check:pages  # live check: are badges shown on Steam's store pages?
```

`check:pages` loads the Chrome build into your installed Google Chrome and reports, per Steam page, every game on a subscription that got no badge. Steam changes its markup without notice, so run it before a release. The wishlist and calendar need a Steam login: on the first run a login window opens, and the check starts once you are logged in. The session is saved to `.auth/`, which is gitignored; never commit or share it. When Steam ends the session, run `bun run check:pages --login`.

Do not run `prettier --write`. The repo has no Prettier config and the defaults would reformat every file. Match the surrounding style by hand: tabs, single quotes.

## Adding a language

Language codes are full BCP 47 tags: `en-US`, `de-DE`, `tr-TR`, `zh-CN`.

1. Add the code to the `Language` union in `src/page/lib/types.ts`.
2. Copy `src/page/lib/i18n/en-US.ts` to `src/page/lib/i18n/<code>.ts`, rename the export to match (`translationsFrFR` for `fr-FR`) and translate every value. Keep the `${...}` placeholders as they are. The `Translations` type flags anything missing.
3. Register it in `src/page/lib/i18n/index.ts`: one entry in `translations`, one in `languageNames`. Use the language's own name (`Français`, not `French`). That name is shown identically in every language, so there is nothing to translate elsewhere.
4. Add a line to `CHANGELOG.md` under the upcoming version.
5. Run `bun run check` and `bun run build`.

Dates are formatted with `Intl.DateTimeFormat` from the language code, so nothing else needs to change.

## Pull requests

Keep them small and say what changed and why. CI runs the typecheck and the build on every pull request; both must pass. By contributing you agree that your contribution is licensed under the GPL-3.0-or-later, like the rest of the project.
