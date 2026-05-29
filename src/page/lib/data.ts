import eaplay from './icons/eaplay.svg';
import eaplaypro from './icons/eaplaypro.svg';
import gamepasscon from './icons/gamepasscon.svg';
import gamepasspc from './icons/gamepasspc.svg';
import ubiplus from './icons/ubiplus.svg';

import type { Platform, PlatformDetails } from './types';

const platformDetails: PlatformDetails = {
	eaplay: {
		name: 'EA PLAY',
		bg: 'bg-eaplay',
		shadow: 'shadow-eaplay',
		icon: eaplay
	},
	eaplaypro: {
		name: 'EA PLAY PRO',
		bg: 'bg-eaplaypro',
		shadow: 'shadow-eaplaypro',
		icon: eaplaypro
	},
	gamepasspc: {
		name: 'PC GAME PASS',
		bg: 'bg-gamepasspc',
		shadow: 'shadow-gamepasspc',
		icon: gamepasspc
	},
	gamepasscon: {
		name: 'XBOX GAME PASS',
		bg: 'bg-gamepasscon',
		shadow: 'shadow-gamepasscon',
		icon: gamepasscon
	},
	ubiplus: {
		name: 'UBISOFT+',
		bg: 'bg-ubiplus',
		shadow: 'shadow-ubiplus',
		icon: ubiplus
	}
};

export const getPlatforms = () => Object.keys(platformDetails) as Platform[];

export const getPlatformDetails = (platform: Platform) => platformDetails[platform];