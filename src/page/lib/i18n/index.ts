import type { Language } from '$lib/types';

import { translationsDe } from './de';
import { translationsEn } from './en';
import { translationsTr } from './tr';
import { translationsZhCN } from './zh-CN';
import type { Translations } from './types';

export type { Translations } from './types';

export const translations: Record<Language, Translations> = {
	en: translationsEn,
	de: translationsDe,
	tr: translationsTr,
	'zh-CN': translationsZhCN,
};

export function getTranslations(language: Language): Translations {
	return translations[language] ?? translations.en;
}
