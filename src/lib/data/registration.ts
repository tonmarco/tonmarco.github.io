import type { RegistrationData } from './types';

export const registration: RegistrationData = {
	currency_code: 'USD',
	currency_name: 'US Dollars',
	registration_open: true,
	registration_closed_reason: 'Click here to register',
	registration_link: 'https://na.eventscloud.com/ic2s2',
	table_note: 'Registration fees to be finalized.',
	early_bird: {
		deadline: 'May 8, 2026',
		student: '250',
		regular: '500',
		tutorials: '90',
		virtual: '30'
	},
	regular: {
		student: '325',
		regular: '600',
		tutorials: '100',
		virtual: '30'
	}
};
