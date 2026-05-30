import type { Translations } from './types';

export const translationsTr: Translations = {
	header: {
		site: 'Site',
		visitWebsite: 'Siteyi ziyaret et',
		settings: 'Ayarlar',
		toggleSettings: 'Ayarları aç veya kapat',
	},
	tabs: {
		added: 'Yeni Eklenenler',
		left: 'Yeni Ayrılanlar',
		coming: 'Yakında',
		leaving: 'Yakında Ayrılacak',
	},
	games: {
		loading: 'Yükleniyor...',
		emptyTitle: 'Oyun bulunamadı',
		emptySubtitle: 'Ayarlardan zaman aralığını değiştirmeyi dene',
	},
	options: {
		title: 'Ayarlar',
		languageTitle: 'Dil',
		languageSubtitle: 'Açılır pencerede kullanılacak dili seç.',
		timeFrameTitle: 'Zaman Aralığı',
		timeFrameSubtitle: 'Değişiklik listesinin ne kadar geriye bakacağını seç.',
		timeFrame7: '7 Gün',
		timeFrame14: '14 Gün',
		timeFrame30: '30 Gün',
		platformsTitle: 'Platformlar',
		platformsSubtitle: 'Gösterilecek servisleri seç.',
		displayTitle: 'Görünüm',
		displaySubtitle: 'Abonelik bilgisi yoksa bilgi çubuklarını göster.',
	},
	support: {
		title: 'Destek',
		subtitle: 'Projeyi destekle veya gelecek güncellemeleri takip et.',
	},
	supporters: {
		title: 'Destekçiler',
		subtitle: 'Projeye katkı sağlayan herkese teşekkürler.',
		loading: 'Destekçiler yükleniyor...',
		unavailable: 'Destekçi listesi şu anda kullanılamıyor.',
		empty: 'Henüz listelenmiş destekçi yok.',
	},
	subscriptionBadge: {
		on: (platformName) => `${platformName}'da`,
		since: (date) => `${date} tarihinden beri`,
		leavingSoon: (gameName, platformName) => `${gameName}, yakında ${platformName} hizmetinden ayrılıyor`,
		leavingOn: (gameName, platformName, date) =>
			`${gameName}, ${date} tarihinde ${platformName} hizmetinden ayrılıyor`,
		leftOn: (gameName, platformName, date) =>
			`${gameName}, ${date} tarihinde ${platformName} hizmetinden ayrıldı`,
		activeSince: (gameName, platformName, date) =>
			`${gameName}, ${date} tarihinden beri ${platformName} hizmetinde`,
	},
	languages: {
		en: 'English',
		de: 'Deutsch',
		tr: 'Türkçe',
	},
};
