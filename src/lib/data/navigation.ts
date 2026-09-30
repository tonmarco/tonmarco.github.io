import type { NavGroup } from './types';

export const navigation: NavGroup[] = [
	{
		name: 'Submit',
		items: [{ name: 'Topics', page: 'topics' }]
	},
	{
		name: 'Attend',
		items: [
			{ name: 'Venue', page: 'venue' },
			{ name: 'Conduct', page: 'conduct' }
		]
	},
	{ name: 'Program', page: 'program' },
	{ name: 'Organizers', page: 'organization' },
	{
		name: 'About',
		items: [
			{ name: 'Previous Editions', page: 'about' },
			{ name: 'ISCSS', page: 'https://iscss.org/' }
		]
	}
];
