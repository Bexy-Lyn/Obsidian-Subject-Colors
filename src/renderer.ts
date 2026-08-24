import { App, MarkdownPostProcessorContext, TFile } from "obsidian";

import { adjustColorLightness, getFileThemeColor } from "./colors";
import type { HeadingLevel, SubjectColorSettings } from "./settings";

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
  settings: SubjectColorSettings,
): void {
  const file = app.vault.getAbstractFileByPath(context.sourcePath);

  if (!(file instanceof TFile)) {
    return;
  }

  const themeColor = getFileThemeColor(app, file, settings.tagColors);

  replaceThemePlaceholdersInText(element, themeColor);

  replaceThemePlaceholdersInAttributes(element, themeColor);

  applyThemeStyles(element, themeColor, settings);
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
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

  const textNodes: Text[] = [];

  let currentNode = walker.nextNode();

  while (currentNode) {
    if (currentNode instanceof Text && shouldProcessTextNode(currentNode)) {
      textNodes.push(currentNode);
    }

    currentNode = walker.nextNode();
  }

  for (const textNode of textNodes) {
    const originalText = textNode.nodeValue;

    if (!originalText) {
      continue;
    }

    textNode.nodeValue = replaceThemePlaceholders(originalText, themeColor);
  }
}

/**
 * Applies the note's theme color and styling configuration
 * to a rendered Markdown section.
 */
function applyThemeStyles(
  element: HTMLElement,
  themeColor: string,
  settings: SubjectColorSettings,
): void {
  element.style.setProperty("--subject-color", themeColor);

  applyHeadingClasses(
    element,
    settings.headingColorLevels,
    settings.headingUnderlineLevels,
  );

  element.toggleClass("subject-themed-dividers", settings.themeDividers);

  element.toggleClass(
    "subject-themed-callouts",
    settings.themeStandardCallouts,
  );
}

/**
 * Adds classes for heading color and underline settings.
 */
function applyHeadingClasses(
  element: HTMLElement,
  colorLevels: HeadingLevel[],
  underlineLevels: HeadingLevel[],
): void {
  const levels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

  for (const level of levels) {
    element.toggleClass(`subject-color-h${level}`, colorLevels.includes(level));

    element.toggleClass(
      `subject-underline-h${level}`,
      underlineLevels.includes(level),
    );
  }
}

/**
 * Returns false for text inside literal code.
 */
function shouldProcessTextNode(node: Text): boolean {
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
function replaceThemePlaceholders(text: string, themeColor: string): string {
  return text.replace(
    THEME_PATTERN,
    (_match, factorText: string | undefined) => {
      if (factorText === undefined) {
        return themeColor;
      }

      const factor = Number(factorText);

      return adjustColorLightness(themeColor, factor);
    },
  );
}

/**
 * Replaces theme placeholders inside HTML/SVG attribute values.
 *
 * Code and preformatted content are ignored.
 */
function replaceThemePlaceholdersInAttributes(
  root: HTMLElement,
  themeColor: string,
): void {
  const elements: Element[] = [root, ...Array.from(root.querySelectorAll("*"))];

  for (const element of elements) {
    if (element.closest("code, pre")) {
      continue;
    }

    for (const attribute of Array.from(element.attributes)) {
      if (!attribute.value.includes("[theme")) {
        continue;
      }

      const replacedValue = replaceThemePlaceholders(
        attribute.value,
        themeColor,
      );

      if (replacedValue !== attribute.value) {
        element.setAttribute(attribute.name, replacedValue);
      }
    }
  }
}
