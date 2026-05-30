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
	};
	support: {
		title: string;
		subtitle: string;
	};
	supporters: {
		title: string;
		subtitle: string;
		loading: string;
		unavailable: string;
		empty: string;
	};
	subscriptionBadge: {
		on: (platformName: string) => string;
		since: (date: string) => string;
		leavingSoon: (gameName: string, platformName: string) => string;
		leavingOn: (gameName: string, platformName: string, date: string) => string;
		leftOn: (gameName: string, platformName: string, date: string) => string;
		activeSince: (gameName: string, platformName: string, date: string) => string;
	};
	languages: Record<Language, string>;
}
