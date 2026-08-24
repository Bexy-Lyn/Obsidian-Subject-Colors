import { App, getAllTags, TFile } from "obsidian";

/**
 * Returns every unique tag found in the vault.
 */
export function getVaultTags(app: App): string[] {
  const tags = new Set<string>();

  for (const file of app.vault.getMarkdownFiles()) {
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

/**
 * Returns the tags of a file in source order.
 *
 * Frontmatter tags come first because the frontmatter appears
 * at the beginning of the Markdown file.
 */
export function getFileTagsInOrder(app: App, file: TFile): string[] {
  const cache = app.metadataCache.getFileCache(file);

  if (!cache) {
    return [];
  }

  const tags: string[] = [];

  // Frontmatter tags
  const frontmatterTags = cache.frontmatter?.tags;

  if (typeof frontmatterTags === "string") {
    tags.push(normalizeTag(frontmatterTags));
  } else if (Array.isArray(frontmatterTags)) {
    for (const tag of frontmatterTags) {
      if (typeof tag === "string") {
        tags.push(normalizeTag(tag));
      }
    }
  }

  // Inline tags
  if (cache.tags) {
    const inlineTags = [...cache.tags].sort(
      (a, b) => a.position.start.offset - b.position.start.offset,
    );

    for (const tag of inlineTags) {
      tags.push(tag.tag);
    }
  }

  return tags;
}

/**
 * Returns the first tag in the file that has an explicitly
 * assigned color.
 *
 * Returns undefined if none of the file's tags have a color.
 */
export function getDefiningTag(
  app: App,
  file: TFile,
  tagColors: Record<string, string>,
): string | undefined {
  const tags = getFileTagsInOrder(app, file);

  for (const tag of tags) {
    if (tagColors[tag] !== undefined) {
      return tag;
    }
  }

  return undefined;
}

/**
 * Ensures a tag always starts with "#".
 */
function normalizeTag(tag: string): string {
  const trimmed = tag.trim();

  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}
