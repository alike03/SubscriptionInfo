import type { Language } from '$lib/types';

export interface Translations {
	header: {
		site: string;
		visitWebsite: string;
		settings: string;
		toggleSettings: string;
	};
	tabs: {
		added: string;
		left: string;
		coming: string;
		leaving: string;
	};
	games: {
		loading: string;
		emptyTitle: string;
		emptySubtitle: string;
	};
	options: {
		title: string;
		languageTitle: string;
		languageSubtitle: string;
		timeFrameTitle: string;
		timeFrameSubtitle: string;
		timeFrame7: string;
		timeFrame14: string;
		timeFrame30: string;
		platformsTitle: string;
		platformsSubtitle: string;
		displayTitle: string;
		displaySubtitle: string;
		requestLanguageTitle: string;
		requestLanguageSubtitle: string;
		requestLanguageAction: string;
	};
	support: {
		title: string;
		subtitle: string;
	};
	supporters: {
		title: string;
		subtitle: string;
		badge: string;
		loading: string;
		unavailable: string;
		empty: string;
	};
	subscriptionBadge: {
		on: (platformName: string) => string;
		leaving: (platformName: string) => string;
		coming: (platformName: string) => string;
		since: (date: string) => string;
		comingShort: (date: string) => string;
		leavingShort: (date: string) => string;
		leavingSoonLabel: string;
		leavingSoon: (gameName: string, platformName: string) => string;
		leavingOn: (gameName: string, platformName: string, date: string) => string;
		comingOn: (gameName: string, platformName: string, date: string) => string;
		leftOn: (gameName: string, platformName: string, date: string) => string;
		activeSince: (gameName: string, platformName: string, date: string) => string;
		noInfoLabel: string;
		noInfo: (gameName: string) => string;
	};
	languages: Record<Language, string>;
}
