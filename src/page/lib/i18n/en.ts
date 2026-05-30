import type { Translations } from './types';

export const translationsEn: Translations = {
	header: {
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
		platformsSubtitle: 'Pick the services that should be shown.',
		displayTitle: 'Display',
		displaySubtitle: 'Show info bars when no subscription info is available.',
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
	subscriptionBadge: {
		on: (platformName) => `on ${platformName}`,
		since: (date) => `Since ${date}`,
		leavingSoon: (gameName, platformName) => `${gameName} is leaving ${platformName} soon`,
		leavingOn: (gameName, platformName, date) => `${gameName} is leaving ${platformName} on ${date}`,
		leftOn: (gameName, platformName, date) => `${gameName} left ${platformName} on ${date}`,
		activeSince: (gameName, platformName, date) =>
			`${gameName} has been on ${platformName} since ${date}`,
	},
	languages: {
		en: 'English',
		de: 'Deutsch',
		tr: 'Türkçe',
	},
};
