import { browser } from '$app/environment';

const STORAGE_KEY = 'ic2s2-saved-items';

function loadSaved(): Set<string> {
	if (!browser) return new Set();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? new Set(JSON.parse(raw)) : new Set();
	} catch {
		return new Set();
	}
}

function persist(items: Set<string>) {
	if (!browser) return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify([...items]));
}

let items = $state(loadSaved());

export const savedItems = {
	get count() {
		return items.size;
	},

	get all(): string[] {
		return [...items];
	},

	has(id: string): boolean {
		return items.has(id);
	},

	toggle(id: string) {
		if (items.has(id)) {
			items.delete(id);
		} else {
			items.add(id);
		}
		items = new Set(items);
		persist(items);
	}
};
