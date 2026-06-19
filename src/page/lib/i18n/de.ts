import type { Translations } from './types';

export const translationsDe: Translations = {
	header: {
		site: 'Seite',
		visitWebsite: 'Webseite besuchen',
		settings: 'Einstellungen',
		toggleSettings: 'Einstellungen umschalten',
	},
	tabs: {
		added: 'Neu hinzugefügt',
		left: 'Zuletzt entfernt',
		coming: 'Bald verfügbar',
		leaving: 'Bald weg',
	},
	games: {
		loading: 'Wird geladen...',
		emptyTitle: 'Keine Spiele gefunden',
		emptySubtitle: 'Versuche, den Zeitraum in den Einstellungen anzupassen',
	},
	options: {
		title: 'Einstellungen',
		languageTitle: 'Sprache',
		languageSubtitle: 'Wähle die Sprache für das Popup.',
		timeFrameTitle: 'Zeitraum',
		timeFrameSubtitle: 'Wähle, wie weit die Änderungsliste zurückreichen soll.',
		timeFrame7: '7 Tage',
		timeFrame14: '14 Tage',
		timeFrame30: '30 Tage',
		platformsTitle: 'Plattformen',
		platformsSubtitle: 'Wähle die Dienste aus, die angezeigt werden sollen.',
		displayTitle: 'Anzeige',
		displaySubtitle: 'Infoleisten anzeigen, wenn keine Abo-Informationen verfügbar sind.',
	},
	support: {
		title: 'Projekt unterstützen',
		subtitle: 'Es ist kostenlos und Open Source. Wenn es dir einen Kauf erspart hat, hält ein Kaffee die Daten am Fließen.',
	},
	supporters: {
		title: 'Unterstützer',
		badge: 'Danke',
		subtitle: 'Danke an alle, die zum Projekt beigetragen haben.',
		loading: 'Unterstützer werden geladen...',
		unavailable: 'Die Unterstützerliste ist gerade nicht verfügbar.',
		empty: 'Es sind noch keine Unterstützer eingetragen.',
	},
	subscriptionBadge: {
		on: (platformName) => `auf ${platformName}`,
		leaving: (platformName) => `verlässt ${platformName}`,
		coming: (platformName) => `kommt zu ${platformName}`,
		since: (date) => `Seit ${date}`,
		comingShort: (date) => `Kommt am ${date}`,
		leavingShort: (date) => `Verlässt am ${date}`,
		leavingSoonLabel: 'Verlässt bald',
		leavingSoon: (gameName, platformName) => `${gameName} verlässt ${platformName} bald`,
		leavingOn: (gameName, platformName, date) => `${gameName} verlässt ${platformName} am ${date}`,
		comingOn: (gameName, platformName, date) => `${gameName} kommt am ${date} zu ${platformName}`,
		leftOn: (gameName, platformName, date) => `${gameName} hat ${platformName} am ${date} verlassen`,
		activeSince: (gameName, platformName, date) =>
			`${gameName} ist seit ${date} auf ${platformName}`,
		noInfoLabel: 'Keine Info',
		noInfo: (gameName) => `${gameName} ist in keinem erfassten Abo verfügbar`,
	},
	languages: {
		en: 'English',
		de: 'Deutsch',
		tr: 'Türkçe',
	},
};
