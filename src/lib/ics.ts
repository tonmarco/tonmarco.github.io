// Minimal RFC 5545 iCalendar builder for the IC2S2 2026 program (Burlington, VT).
// Times are emitted as local wall-clock with a self-contained America/New_York
// VTIMEZONE so calendar apps render the correct Eastern (EDT/EST) time.

const TZID = 'America/New_York';

const VTIMEZONE = [
	'BEGIN:VTIMEZONE',
	`TZID:${TZID}`,
	'BEGIN:DAYLIGHT',
	'TZOFFSETFROM:-0500',
	'TZOFFSETTO:-0400',
	'TZNAME:EDT',
	'DTSTART:19700308T020000',
	'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
	'END:DAYLIGHT',
	'BEGIN:STANDARD',
	'TZOFFSETFROM:-0400',
	'TZOFFSETTO:-0500',
	'TZNAME:EST',
	'DTSTART:19701101T020000',
	'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
	'END:STANDARD',
	'END:VTIMEZONE'
];

export interface IcsEvent {
	uid: string;
	/** Local start, formatted YYYYMMDDTHHMMSS. */
	start: string;
	/** Local end, formatted YYYYMMDDTHHMMSS. */
	end: string;
	summary: string;
	location?: string;
	description?: string;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

// Parse "9:00", "13:30", "9:00am", "12:00pm" -> minutes since midnight, or null.
// Program events use 24-hour times; tutorials use 12-hour am/pm times.
function parseClock(t: string): number | null {
	const m = t.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
	if (!m) return null;
	let h = Number(m[1]);
	if (m[3] === 'pm' && h !== 12) h += 12;
	else if (m[3] === 'am' && h === 12) h = 0;
	return h * 60 + Number(m[2] ?? 0);
}

const clockStr = (mins: number) => `${pad2(Math.floor(mins / 60) % 24)}${pad2(mins % 60)}00`;

/**
 * Build local DTSTART/DTEND timestamps from a YYYYMMDD date and a display time
 * range ("9:00–10:30", "1:00pm - 4:00pm"). A missing/unparseable end time
 * defaults to start + defaultMins. Returns null if the start can't be parsed.
 */
export function localRange(
	ymd: string,
	timeRange: string,
	defaultMins = 60
): { start: string; end: string } | null {
	const parts = timeRange.split(/[–—-]/).map((s) => s.trim()).filter(Boolean);
	if (!parts.length) return null;
	const startMin = parseClock(parts[0]);
	if (startMin == null) return null;
	const endMin = parts[1] ? parseClock(parts[1]) : null;
	return {
		start: `${ymd}T${clockStr(startMin)}`,
		end: `${ymd}T${clockStr(endMin ?? startMin + defaultMins)}`
	};
}

function escapeText(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r?\n/g, '\\n');
}

// Fold lines longer than 75 octets per RFC 5545 (continuation lines start with
// a space). Counts UTF-8 octets, not chars, and never splits a code point.
const encoder = new TextEncoder();
function fold(line: string): string {
	if (encoder.encode(line).length <= 75) return line;
	const parts: string[] = [];
	let cur = '';
	let curBytes = 0;
	for (const ch of line) {
		const chBytes = encoder.encode(ch).length;
		if (curBytes + chBytes > 75) {
			parts.push(cur);
			cur = ' ';
			curBytes = 1;
		}
		cur += ch;
		curBytes += chBytes;
	}
	parts.push(cur);
	return parts.join('\r\n');
}

export function buildIcs(events: IcsEvent[], dtstamp: string): string {
	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//IC2S2 2026//Program//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		...VTIMEZONE
	];
	for (const ev of events) {
		lines.push('BEGIN:VEVENT');
		lines.push(`UID:${ev.uid}`);
		lines.push(`DTSTAMP:${dtstamp}`);
		lines.push(`DTSTART;TZID=${TZID}:${ev.start}`);
		lines.push(`DTEND;TZID=${TZID}:${ev.end}`);
		lines.push(fold(`SUMMARY:${escapeText(ev.summary)}`));
		if (ev.location) lines.push(fold(`LOCATION:${escapeText(ev.location)}`));
		if (ev.description) lines.push(fold(`DESCRIPTION:${escapeText(ev.description)}`));
		lines.push('END:VEVENT');
	}
	lines.push('END:VCALENDAR');
	return lines.join('\r\n');
}
