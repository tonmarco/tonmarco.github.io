// Joins the schedule spine (program) to the detail catalogs (keynotes,
// tutorials, posters) so page components can consume fully-resolved records
// instead of looking up keys themselves.
import type { ProgramEvent, HydratedEvent, HydratedDay } from '../types';
import { program, parallelSessions, posters } from '.';
import { keynotes } from './keynotes';
import { tutorials } from './tutorials';

// Build the lookup tables once at module load.
const speakerByName = new Map(keynotes.speakers.map((s) => [s.name, s] as const));
const tutorialById = new Map(tutorials.items.map((t) => [t.id, t] as const));
const sessionByTitle = new Map(parallelSessions.map((s) => [s.title, s] as const));
const posterSessionByDate = new Map(posters.map((p) => [p.date, p] as const));

function resolveEvent(event: ProgramEvent, date: string): HydratedEvent {
	const { speakers, tutorials: tutorialIds, parallelSessions: sessionTitles, ...base } = event;
	const hydrated = { ...base } as HydratedEvent;

	if (speakers) {
		hydrated.speakers = speakers.map((name) => {
			const match = speakerByName.get(name);
			if (!match) {
				throw new Error(`program.ts references unknown keynote speaker: "${name}"`);
			}
			return match;
		});
	}

	if (tutorialIds) {
		hydrated.tutorials = tutorialIds.map((id) => {
			const match = tutorialById.get(id);
			if (!match) {
				throw new Error(`program.ts references unknown tutorial id: ${id}`);
			}
			return match;
		});
	}

	if (sessionTitles) {
		hydrated.parallelSessions = sessionTitles.map((title) => {
			const match = sessionByTitle.get(title);
			if (!match) {
				throw new Error(`program.ts references unknown parallel session: "${title}"`);
			}
			return match;
		});
	}

	// Poster events join to a session by matching the day's date.
	if (event.type === 'poster') {
		hydrated.posterSession = posterSessionByDate.get(date);
	}

	return hydrated;
}

/** The full program with every reference resolved to its record. */
export const hydratedProgram: HydratedDay[] = program.map((day) => ({
	day: day.day,
	date: day.date,
	events: day.events.map((event) => resolveEvent(event, day.date))
}));