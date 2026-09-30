// Keynote speakers
export interface Speaker {
	name: string;
	affiliation: string;
	field?: string;
	title: string;
	chair_name?: string;
	date?: string;
	abstract: string;
	bio: string;
	image: string;
	url: string;
}

export interface KeynotesData {
	show_details: boolean;
	speakers: Speaker[];
}

// Sponsors
export interface SponsorLevel {
	title: string;
	price: string;
	benefits: string[];
}

export interface Sponsor {
	name: string;
	url: string;
	image: string;
	width?: number;
}

export interface SponsorGroup {
	title: string;
	sponsors: Sponsor[];
}

export interface SponsorsData {
	levels: SponsorLevel[];
	sponsors: SponsorGroup[];
}

// Important dates
export interface ImportantDate {
	text: string;
	done: boolean;
	category: 'conference' | 'tutorial';
}

// Navigation
export interface NavItem {
	name: string;
	page: string;
}

export interface NavGroup {
	name: string;
	items?: NavItem[];
	page?: string;
}

// People / Organizers
export interface Person {
	name: string;
	affiliation?: string;
	field?: string;
	image?: string;
	url?: string;
}

export interface PeopleGroup {
	title: string;
	people: Person[];
}

// Program / Schedule
export type EventType =
	| 'registration'
	| 'remarks'
	| 'lightning'
	| 'keynote'
	| 'parallel'
	| 'poster'
	| 'break'
	| 'lunch'
	| 'tutorial'
	| 'social';

export interface SessionItem {
	title: string;
	presenters?: string;
	time?: string;
}

export interface ProgramEvent {
	time: string;
	title: string;
	type: EventType;
	location?: string;
	chairs?: string;
	/** Speaker names for keynote events; each matches a `name` in keynotes.ts. */
	speakers?: string[];
	/** Tutorial ids for tutorial blocks; each matches an `id` in tutorials.ts. */
	tutorials?: number[];
	/** Session titles for parallel blocks; each matches a `title` in parallel_sessions.ts. */
	parallelSessions?: string[];
	items?: SessionItem[];
}

export interface ProgramDay {
	day: string;
	date: string;
	events: ProgramEvent[];
}

// Posters
export interface Poster {
	id: number;
	title: string;
	authors: string;
	theme: string;
	keywords: string;
	abstract: string;
}

export interface PosterSession {
	day: number;
	session: string;
	date: string;
	posters: Poster[];
}

// Parallel sessions
export interface ParallelPaper {
	submission: number;
	title: string;
	authors: string;
	abstract?: string;
}

export interface ParallelSession {
	title: string; // unique session name — the join key
	day: number; // 2, 3, 4
	time: 'AM' | 'PM';
	track: string; // session letter A–H
	room?: string; // assigned room, from the program workbook
	chair?: string; // session chair's name, from the program workbook
	papers: ParallelPaper[];
}

export interface VirtualPresentation {
	submission: number;
	title: string;
	authors: string;
	format: 'Parallel' | 'Poster';
	timeET: string;
	timeLocal: string;
	speakingFrom: string;
}

export interface VirtualSession {
	track: number;
	session: number;
	theme: string;
	presentations: VirtualPresentation[];
}

export interface VirtualTimeSlot {
	time: string;
	// One session per track sharing this start time (build_data.py emits however
	// many exist — usually two, but not guaranteed).
	sessions: VirtualSession[];
}

// Program (hydrated) — the shape after references are resolved to full records.
// Produced by program-resolver.ts; this is what page components consume.
export interface HydratedEvent {
	time: string;
	title: string;
	type: EventType;
	location?: string;
	chairs?: string;
	speakers?: Speaker[];
	tutorials?: Tutorial[];
	parallelSessions?: ParallelSession[];
	posterSession?: PosterSession;
	items?: SessionItem[];
}

export interface HydratedDay {
	day: string;
	date: string;
	events: HydratedEvent[];
}

// Registration
export interface PricingTier {
	deadline?: string;
	student: string;
	regular: string;
	tutorials: string;
	virtual?: string;
}

export interface RegistrationData {
	currency_code: string;
	currency_name: string;
	registration_open: boolean;
	registration_closed_reason?: string;
	registration_link: string;
	table_note?: string;
	early_bird: PricingTier;
	regular: PricingTier;
	conference_dinner?: string;
}

// Accommodation
export interface BookingLink {
	url: string;
	text: string;
}

export interface Hotel {
	name: string;
	booking_links: BookingLink[];
}

export interface HousingRate {
	type: string;
	price: string;
}

export interface CampusHousing {
	name: string;
	description: string;
	rates: HousingRate[];
}

export interface BnbOption {
	name: string;
	url: string;
}

export interface AccommodationData {
	hotels: Hotel[];
	campus_housing: CampusHousing[];
	bnb_options: BnbOption[];
}

// Tutorials
export interface Tutor {
	name: string;
	affiliation: string;
	image?: string;
	website?: string;
}

export interface Tutorial {
	id: number;
	title: string;
	time: string;
	room: string;
	abstract: string;
	tutors: Tutor[];
	website?: string;
}

export interface TutorialSchedule {
	day: string;
	venue_opens: string;
	morning_time: string;
	afternoon_time: string;
	coffee_break_one?: string;
	coffee_break_two?: string;
	morning_tutorials: number[];
	afternoon_tutorials: number[];
}

export interface PastTutorial {
	title: string;
	abstract: string;
	tutors: { name: string; affiliation?: string }[];
}

export interface TutorialsData {
	schedule: TutorialSchedule;
	items: Tutorial[];
	past_tutorials: PastTutorial[];
}

// Submission
export interface SubmissionData {
	call4abstracts_link: string;
	call4abstracts_open: boolean;
	call4tutorials_link: string;
	call4tutorials_open: boolean;
}

// Travel grants
export interface TravelGrantsData {
	application_deadline: string;
	grant_notification: string;
	application_form: string;
}

// Social media
export interface SocialLink {
	title: string;
	link: string;
}

export interface SocialMediaData {
	show: boolean;
	links: SocialLink[];
}