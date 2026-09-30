import type { ImportantDate } from './types';

export const confDays = [
	{ ymd: '20270726', label: 'Mon Jul 26' },
	{ ymd: '20270727', label: 'Tue Jul 27' },
	{ ymd: '20270728', label: 'Wed Jul 28' },
	{ ymd: '20270729', label: 'Thu Jul 29' }
] as const;

export const dates: ImportantDate[] = [
	{ text: 'Abstract submission deadline: TBA', done: false, category: 'conference' },
	{ text: 'Tutorial day: July 26, 2027', done: false, category: 'tutorial' },
	{ text: 'Conference days: July 27-29, 2027', done: false, category: 'conference' }
];
