import {
	App,
	MarkdownPostProcessorContext,
	TFile,
} from "obsidian";

import { adjustColorLightness, getThemeAccentColor } from "./colors";
import { getDefiningTag } from "./tags";

/**
 * Matches:
 *
 *   [theme]
 *   [theme/1.2]
 *   [theme/0.8]
 *   [theme/2]
 *
 * The optional capture group contains the lightness factor.
 */
const THEME_PATTERN = /\[theme(?:\/(\d+(?:\.\d+)?))?\]/g;

/**
 * Processes one rendered Markdown section.
 *
 * It determines the note's theme color and replaces theme
 * placeholders in ordinary rendered text.
 *
 * Code and preformatted text are deliberately ignored.
 */
export function processThemePlaceholders(
	app: App,
	element: HTMLElement,
	context: MarkdownPostProcessorContext,
	tagColors: Record<string, string>,
): void {
	const file = app.vault.getAbstractFileByPath(
		context.sourcePath,
	);

	if (!(file instanceof TFile)) {
		return;
	}

	const themeColor = getFileThemeColor(
		app,
		file,
		tagColors,
	);

	replaceThemePlaceholdersInText(
		element,
		themeColor,
	);
}

/**
 * Returns the effective theme color for a file.
 *
 * If the file has a tag with an assigned color, that color wins.
 * Otherwise Obsidian's current accent color is used.
 */
function getFileThemeColor(
	app: App,
	file: TFile,
	tagColors: Record<string, string>,
): string {
	const definingTag = getDefiningTag(
		app,
		file,
		tagColors,
	);

	if (definingTag !== undefined && tagColors[definingTag]) {
		return tagColors[definingTag];
	}

	return getThemeAccentColor();
}

/**
 * Walks through rendered text nodes and replaces theme placeholders.
 *
 * <code> and <pre> elements are skipped.
 */
function replaceThemePlaceholdersInText(
	root: HTMLElement,
	themeColor: string,
): void {
	const walker = document.createTreeWalker(
		root,
		NodeFilter.SHOW_TEXT,
	);

	const textNodes: Text[] = [];

	let currentNode = walker.nextNode();

	while (currentNode) {
		if (
			currentNode instanceof Text &&
			shouldProcessTextNode(currentNode)
		) {
			textNodes.push(currentNode);
		}

		currentNode = walker.nextNode();
	}

	for (const textNode of textNodes) {
		const originalText = textNode.nodeValue;

		if (!originalText) {
			continue;
		}

		textNode.nodeValue = replaceThemePlaceholders(
			originalText,
			themeColor,
		);
	}
}

/**
 * Returns false for text inside literal code.
 */
function shouldProcessTextNode(
	node: Text,
): boolean {
	const parent = node.parentElement;

	if (!parent) {
		return false;
	}

	if (parent.closest("code, pre")) {
		return false;
	}

	return true;
}

/**
 * Replaces all theme placeholders inside a string.
 */
function replaceThemePlaceholders(
	text: string,
	themeColor: string,
): string {
	return text.replace(
		THEME_PATTERN,
		(_match, factorText: string | undefined) => {
			if (factorText === undefined) {
				return themeColor;
			}

			const factor = Number(factorText);

			return adjustColorLightness(
				themeColor,
				factor,
			);
		},
	);
}