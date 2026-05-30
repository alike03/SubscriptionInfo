export interface Game {
	id: string;
	sid: number;
	name: string;
	poster: string;
	subs: SubscriptionInfo[];
}

export type Platform = 'eaplay' | 'eaplaypro' | 'gamepasspc' | 'gamepasscon' | 'ubiplus';

export type Language = 'en' | 'de' | 'tr';

export interface SubscriptionInfo {
	platform: Platform;
	entry: string;
	leave: string;
	leaving: boolean;
}

export type PlatformDetails = Record<
	Platform,
	{
		name: string;
		bg: string;
		shadow: string;
		icon: string;
	}
>;

export interface ExtensionOptions {
	enabled: Record<Platform, boolean>;
	timeFrame: number;
	showNoInfoBar: boolean;
	language: Language;
}

export interface StorageData {
	aSub_options?: {
		options: ExtensionOptions;
	};
}

export interface GameResponse {
	sid: number;
	status: 'found' | 'missing';
	name?: string;
	subs?: Record<Platform, SubStatus>;
	affiliate?: string;
}

export interface SubStatus {
	status: 'active' | 'left' | 'leaving' | 'soon' | 'missing';
	date: {
		since?: string;
		until?: string;
	};
	link?: string;
	target?: string;
}

export interface MenuSection {
	title: string;
	games: Game[];
}