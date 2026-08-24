import {
	App,
	MarkdownView,
} from "obsidian";

import { getFileThemeColor } from "./colors";

import type {
	HeadingLevel,
	SubjectColorSettings,
} from "./settings";

/**
 * Applies subject-color styling to all currently open Markdown views.
 *
 * This is primarily used for Live Preview / editor styling.
 */
export function refreshMarkdownViewStyles(
	app: App,
	settings: SubjectColorSettings,
): void {
	const leaves =
		app.workspace.getLeavesOfType("markdown");

	for (const leaf of leaves) {
		if (!(leaf.view instanceof MarkdownView)) {
			continue;
		}

		applyMarkdownViewStyles(
			app,
			leaf.view,
			settings,
		);
	}
}

function applyMarkdownViewStyles(
	app: App,
	view: MarkdownView,
	settings: SubjectColorSettings,
): void {
	const file = view.file;

	if (!file) {
		clearViewStyles(view);
		return;
	}

	const themeColor = getFileThemeColor(
		app,
		file,
		settings.tagColors,
	);

	const container = view.containerEl;

	container.style.setProperty(
		"--subject-color",
		themeColor,
	);

	applyHeadingClasses(
		container,
		settings.headingColorLevels,
		settings.headingUnderlineLevels,
	);

	container.toggleClass(
		"subject-themed-dividers",
		settings.themeDividers,
	);

	container.toggleClass(
		"subject-themed-callouts",
		settings.themeStandardCallouts,
	);
}

function applyHeadingClasses(
	element: HTMLElement,
	colorLevels: HeadingLevel[],
	underlineLevels: HeadingLevel[],
): void {
	const levels: HeadingLevel[] = [
		1,
		2,
		3,
		4,
		5,
		6,
	];

	for (const level of levels) {
		element.toggleClass(
			`subject-color-h${level}`,
			colorLevels.includes(level),
		);

		element.toggleClass(
			`subject-underline-h${level}`,
			underlineLevels.includes(level),
		);
	}
}

function clearViewStyles(
	view: MarkdownView,
): void {
	const container = view.containerEl;

	container.style.removeProperty(
		"--subject-color",
	);

	const levels: HeadingLevel[] = [
		1,
		2,
		3,
		4,
		5,
		6,
	];

	for (const level of levels) {
		container.removeClass(
			`subject-color-h${level}`,
		);

		container.removeClass(
			`subject-underline-h${level}`,
		);
	}

	container.removeClass(
		"subject-themed-dividers",
	);

	container.removeClass(
		"subject-themed-callouts",
	);
}