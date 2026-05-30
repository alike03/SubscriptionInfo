import type { Translations } from './types';

export const translationsTr: Translations = {
	header: {
		badge: 'Tarayici Eklentisi',
		subtitle: 'Aboneliklerindeki degisiklikleri takip et.',
		site: 'Site',
		visitWebsite: 'Siteyi ziyaret et',
		settings: 'Ayarlar',
		toggleSettings: 'Ayarlari ac veya kapat',
	},
	tabs: {
		added: 'Yeni Eklenenler',
		left: 'Yeni Ayrilanlar',
		coming: 'Yakinda',
		leaving: 'Yakinda Ayrilacak',
	},
	games: {
		loading: 'Yukleniyor...',
		emptyTitle: 'Oyun bulunamadi',
		emptySubtitle: 'Ayarlardan zaman araligini degistirmeyi dene',
	},
	options: {
		title: 'Ayarlar',
		languageTitle: 'Dil',
		languageSubtitle: 'Acilir pencerede kullanilacak dili sec.',
		timeFrameTitle: 'Zaman Araligi',
		timeFrameSubtitle: 'Degisiklik listesinin ne kadar geriye bakacagini sec.',
		timeFrame7: '7 Gun',
		timeFrame14: '14 Gun',
		timeFrame30: '30 Gun',
		platformsTitle: 'Platformlar',
		platformsSubtitle: 'Acilir pencere sonucunu etkileyecek servisleri sec.',
		displayTitle: 'Gorunum',
		displaySubtitle: 'Eslesmeyen oyunlar icin bilgi cubuklarini goster veya gizle.',
		shown: 'Gorunur',
		hidden: 'Gizli',
	},
	support: {
		title: 'Destek',
		subtitle: 'Projeyi destekle veya gelecek guncellemeleri takip et.',
	},
	supporters: {
		title: 'Destekciler',
		subtitle: 'Projeye katki saglayan herkese tesekkurler.',
		loading: 'Destekciler yukleniyor...',
		unavailable: 'Destekci listesi su anda kullanilamiyor.',
		empty: 'Henuz listelenmis destekci yok.',
	},
	subscriptionBadge: {
		on: 'ÜZERINDE',
		since: 'Başlangıç',
		leavingSoon: (gameName, platformName) => `${gameName}, yakinda ${platformName} hizmetinden ayriliyor`,
		leavingOn: (gameName, platformName, date) =>
			`${gameName}, ${date} tarihinde ${platformName} hizmetinden ayriliyor`,
		leftOn: (gameName, platformName, date) =>
			`${gameName}, ${date} tarihinde ${platformName} hizmetinden ayrildi`,
		activeSince: (gameName, platformName, date) =>
			`${gameName}, ${date} tarihinden beri ${platformName} hizmetinde`,
	},
	languages: {
		en: 'English',
		de: 'Deutsch',
		tr: 'Türkçe',
	},
};
