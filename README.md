# alike03's Subscription Info on Steam

[![Firefox version](https://img.shields.io/amo/v/alike03s-subscription-info?label=Firefox&style=for-the-badge)](https://addons.mozilla.org/en-US/firefox/addon/alike03s-subscription-info/)
[![Firefox rating](https://img.shields.io/amo/stars/alike03s-subscription-info?label=firefox%20rating&style=for-the-badge)](https://addons.mozilla.org/en-US/firefox/addon/alike03s-subscription-info/)
[![Firefox users](https://img.shields.io/amo/users/alike03s-subscription-info?label=firefox%20users&style=for-the-badge&color=dd2222)](https://addons.mozilla.org/en-US/firefox/addon/alike03s-subscription-info/)

[![Chrome version](https://img.shields.io/chrome-web-store/v/jecikjbpiedagpmibmgpfgnkfpomgeok?label=Chrome&style=for-the-badge)](https://chrome.google.com/webstore/detail/jecikjbpiedagpmibmgpfgnkfpomgeok/)
[![Chrome rating](https://img.shields.io/chrome-web-store/stars/jecikjbpiedagpmibmgpfgnkfpomgeok?label=Chrome%20rating&style=for-the-badge)](https://chrome.google.com/webstore/detail/jecikjbpiedagpmibmgpfgnkfpomgeok/)
[![Chrome users](https://img.shields.io/chrome-web-store/users/jecikjbpiedagpmibmgpfgnkfpomgeok?label=Chrome%20users&style=for-the-badge&color=dd2222)](https://chrome.google.com/webstore/detail/jecikjbpiedagpmibmgpfgnkfpomgeok/)

[![Edge version](https://img.shields.io/badge/dynamic/json?label=edge&style=for-the-badge&%20add-on&prefix=V&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbapbeljhlgbcmoofikfboidiooefimdp)](https://microsoftedge.microsoft.com/addons/detail/alike03s-subscription-in/bapbeljhlgbcmoofikfboidiooefimdp)
[![Edge rating](https://img.shields.io/badge/dynamic/json?label=edge%20rating&color=%2344cc11&style=for-the-badge&suffix=/5&query=%24.averageRating&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbapbeljhlgbcmoofikfboidiooefimdp)](https://microsoftedge.microsoft.com/addons/detail/alike03s-subscription-in/bapbeljhlgbcmoofikfboidiooefimdp)
[![Edge users](https://img.shields.io/badge/dynamic/json?label=Edge%20users&style=for-the-badge&color=%23dd2222&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fbapbeljhlgbcmoofikfboidiooefimdp)](https://microsoftedge.microsoft.com/addons/detail/alike03s-subscription-in/bapbeljhlgbcmoofikfboidiooefimdp)

Have you ever bought a game only to discover later that it was already included in a subscription service you use? This browser extension adds subscription availability directly to Steam, so you can see whether a game is available through a tracked service before buying it.

The extension checks Steam games against the Subscription Info database and displays availability for:

- PC Game Pass
- Xbox Game Pass
- Ubisoft+
- EA Play
- EA Play Pro

[Changelog](https://aligueler.com/SubscriptionInfo/#changelog)

## Download

[![Download for Firefox](/public/images/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/alike03s-subscription-info/)
[![Download for Chrome](/public/images/chrome.png)](https://chrome.google.com/webstore/detail/jecikjbpiedagpmibmgpfgnkfpomgeok/)
[![Download for Edge](/public/images/edge.png)](https://microsoftedge.microsoft.com/addons/detail/alike03s-subscription-in/bapbeljhlgbcmoofikfboidiooefimdp)

## Features

- Adds subscription badges to Steam app pages, search results, wishlists, sale widgets, and other dynamic store areas.
- Shows whether a game is active, coming soon, leaving soon, or already left a subscription service.
- Provides a popup with recently added, recently left, coming soon, and leaving soon games.
- Lets you enable or disable individual platforms.

## Development

This project is a Manifest V3 WebExtension built with Svelte, Vite, Tailwind CSS, and Bun.

Install dependencies:

```sh
bun install
```

Start a development build:

```sh
bun run dev
```

Target a specific browser during development:

```sh
bun run dev:chrome
bun run dev:firefox
```

Run checks:

```sh
bun run check
bun run lint
```

## Build

Build Chrome and Firefox packages:

```sh
bun run build
```

Build a single target:

```sh
bun run build:chrome
bun run build:firefox
```

The Chrome build can also be used for Chromium-based browsers such as Microsoft Edge.

## Project Structure

- `src/manifest.json` - shared Manifest V3 source used by Vite.
- `src/page/content/` - Steam page integration and injected subscription badges.
- `src/page/background/` - background worker.
- `src/page/lib/` - API, storage, cache, platform metadata, i18n, and shared components.
- `src/popup/` - browser action popup UI.
- `public/` - extension icons and README download images.

## Data

The extension queries `https://sub.aligueler.com` with Steam app IDs to find matching subscription availability. User settings are stored with browser extension storage.

## Support Me

If you like this addon, please consider supporting me. You can do this by donating via PayPal or buying me a coffee. Your support is greatly appreciated!

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/alike03)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/alike03)

## Star History

<a href="https://www.star-history.com/?type=date&repos=alike03%2FSubscriptionInfo">
	<picture>
		<source
			media="(prefers-color-scheme: dark)"
			srcset="https://api.star-history.com/chart?repos=alike03/SubscriptionInfo&type=date&theme=dark&legend=top-left&sealed_token=ldsdeiYK-JDAcZAoPQBGJgAs0zBXb177y3UjAzK8mABbeDp1kKkZTvvnpw2yaxhq98prVqbcdteLxqMWHBUlFCXiHUez1MKjE0Im7O9RPjbBPZzytb6PAzrJsiNTPhNdYAEwhHCRdCbrj-zw8wTanLSKw_JZYviivUsF37dmQdPz7uQ3o0vYb9ZLwy0u"
		/>
		<source
			media="(prefers-color-scheme: light)"
			srcset="https://api.star-history.com/chart?repos=alike03/SubscriptionInfo&type=date&legend=top-left&sealed_token=ldsdeiYK-JDAcZAoPQBGJgAs0zBXb177y3UjAzK8mABbeDp1kKkZTvvnpw2yaxhq98prVqbcdteLxqMWHBUlFCXiHUez1MKjE0Im7O9RPjbBPZzytb6PAzrJsiNTPhNdYAEwhHCRdCbrj-zw8wTanLSKw_JZYviivUsF37dmQdPz7uQ3o0vYb9ZLwy0u"
		/>
		<img
			alt="Star History Chart"
			src="https://api.star-history.com/chart?repos=alike03/SubscriptionInfo&type=date&legend=top-left&sealed_token=ldsdeiYK-JDAcZAoPQBGJgAs0zBXb177y3UjAzK8mABbeDp1kKkZTvvnpw2yaxhq98prVqbcdteLxqMWHBUlFCXiHUez1MKjE0Im7O9RPjbBPZzytb6PAzrJsiNTPhNdYAEwhHCRdCbrj-zw8wTanLSKw_JZYviivUsF37dmQdPz7uQ3o0vYb9ZLwy0u"
		/>
	</picture>
</a>
