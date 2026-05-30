export interface Game {
	id: string;
	sid: number;
	name: string;
	poster: string;
	subs: SubscriptionInfo[];
}

export type Platform = 'eaplay' | 'eaplaypro' | 'gamepasspc' | 'gamepasscon' | 'ubiplus';
export type SubscriptionPlatform = Platform | 'gamepass' | (string & {});

export type Language = 'en' | 'de' | 'tr';

export interface SubscriptionInfo {
	platform: SubscriptionPlatform;
	entry: string;
	leave: string;
	leaving: boolean;
}

export interface PlatformDetail {
	name: string;
	bg: string;
	shadow: string;
	icon: string;
}

export type PlatformDetails = Record<Platform, PlatformDetail>;

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

export type TabType = 'added' | 'left' | 'coming' | 'leaving';

export interface TabDefinition {
	id: TabType;
	label: string;
}
