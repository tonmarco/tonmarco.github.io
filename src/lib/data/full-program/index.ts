// Typed access to the generated program data.
// The *.json here are built by scripts/build_data.py (raw → JSON); the types
// live in ../types. This barrel just attaches the types and gives named exports.
import type { ParallelSession, PosterSession, VirtualTimeSlot, ProgramDay } from '../types';
import parallelSessionsData from './parallel-sessions.json';
import posterData from './poster.json';
import virtualDayData from './virtual-day.json';
import programData from './program.json';

export const parallelSessions = parallelSessionsData as ParallelSession[];
export const posters = posterData as PosterSession[];
export const virtualDaySchedule = virtualDayData as VirtualTimeSlot[];
export const program = programData as ProgramDay[];
