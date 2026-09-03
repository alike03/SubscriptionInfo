import type { Language } from '$lib/types';

import { translationsDeDE } from './de-DE';
import { translationsEnUS } from './en-US';
import { translationsTrTR } from './tr-TR';
import { translationsZhCN } from './zh-CN';
import type { Translations } from './types';

export type { Translations } from './types';

export const translations: Record<Language, Translations> = {
	'en-US': translationsEnUS,
	'de-DE': translationsDeDE,
	'tr-TR': translationsTrTR,
	'zh-CN': translationsZhCN,
};

// Native names only, so the list is the same in every language.
export const languageNames: Record<Language, string> = {
	'en-US': 'English',
	'de-DE': 'Deutsch',
	'tr-TR': 'Türkçe',
	'zh-CN': '简体中文',
};

export function getTranslations(language: Language): Translations {
	return translations[language] ?? translations['en-US'];
}
