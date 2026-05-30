import type { Translations } from './types';

export const translationsEn: Translations = {
	header: {
		badge: 'Browser Extension',
		subtitle: 'Track what changed across your subscriptions.',
		site: 'Site',
		visitWebsite: 'Visit website',
		settings: 'Settings',
		toggleSettings: 'Toggle settings',
	},
	tabs: {
		added: 'Recently Added',
		left: 'Recently Left',
		coming: 'Coming Soon',
		leaving: 'Leaving Soon',
	},
	games: {
		loading: 'Loading...',
		emptyTitle: 'No games found',
		emptySubtitle: 'Try adjusting the time frame in settings',
	},
	options: {
		title: 'Settings',
		languageTitle: 'Language',
		languageSubtitle: 'Choose the language used in the popup.',
		timeFrameTitle: 'Time Frame',
		timeFrameSubtitle: 'Choose how far back the change list should look.',
		timeFrame7: '7 Days',
		timeFrame14: '14 Days',
		timeFrame30: '30 Days',
		platformsTitle: 'Platforms',
		platformsSubtitle: 'Pick the services that should affect the popup results.',
		displayTitle: 'Display',
		displaySubtitle: 'Show or hide info bars for unassigned titles.',
		shown: 'Shown',
		hidden: 'Hidden',
	},
	support: {
		title: 'Support',
		subtitle: 'Support the project or follow future updates.',
	},
	supporters: {
		title: 'Supporters',
		subtitle: 'Thanks to everyone who has contributed to the project.',
		loading: 'Loading supporters...',
		unavailable: 'Supporter list unavailable right now.',
		empty: 'No supporters listed yet.',
	},
	languages: {
		en: 'English',
		de: 'Deutsch',
		tr: 'Turkce',
	},
};