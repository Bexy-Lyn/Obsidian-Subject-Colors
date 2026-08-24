import { App, getAllTags } from "obsidian";

/**
 * Returns every unique tag found in the vault.
 *
 * Tags include their leading "#", for example:
 *   #math
 *   #physics
 *   #uni/mathematics
 *
 * The returned list is sorted alphabetically.
 */
export function getVaultTags(app: App): string[] {
	const tags = new Set<string>();

	const files = app.vault.getMarkdownFiles();

	for (const file of files) {
		const cache = app.metadataCache.getFileCache(file);

		if (!cache) {
			continue;
		}

		const fileTags = getAllTags(cache);

		if (!fileTags) {
			continue;
		}

		for (const tag of fileTags) {
			tags.add(tag);
		}
	}

	return Array.from(tags).sort((a, b) =>
		a.localeCompare(b, undefined, {
			sensitivity: "base",
		}),
	);
}