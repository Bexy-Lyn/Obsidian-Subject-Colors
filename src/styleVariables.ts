export function applyAccentVariables(
  element: HTMLElement,
  themeColor: string,
): void {
  const hoverColor = `color-mix(
			in oklch,
			${themeColor} 80%,
			var(--text-normal)
		)`;

  const subtleColor = `color-mix(
			in oklch,
			${themeColor} 20%,
			transparent
		)`;

  // Core subject color
  element.style.setProperty("--subject-color", themeColor);

  // Obsidian accent hierarchy
  element.style.setProperty("--color-accent", themeColor);

  element.style.setProperty("--color-accent-1", hoverColor);

  element.style.setProperty("--color-accent-2", hoverColor);

  // Semantic accent colors
  element.style.setProperty("--text-accent", themeColor);

  element.style.setProperty("--text-accent-hover", hoverColor);

  element.style.setProperty("--interactive-accent", themeColor);

  element.style.setProperty("--interactive-accent-hover", hoverColor);

  // Links
  element.style.setProperty("--link-color", themeColor);

  element.style.setProperty("--link-color-hover", hoverColor);

  element.style.setProperty("--link-external-color", themeColor);

  element.style.setProperty("--link-external-color-hover", hoverColor);

  element.style.setProperty("--link-unresolved-color", themeColor);

  // Tags
  element.style.setProperty("--tag-color", themeColor);

  element.style.setProperty("--tag-color-hover", hoverColor);

  element.style.setProperty("--tag-background", subtleColor);

  element.style.setProperty("--tag-background-hover", subtleColor);
}
