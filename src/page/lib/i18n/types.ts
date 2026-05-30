import type { Language } from '$lib/types';

export interface Translations {
	header: {
		badge: string;
		subtitle: string;
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
		shown: string;
		hidden: string;
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
	languages: Record<Language, string>;
}