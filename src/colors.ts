export interface RGBColor {
	r: number;
	g: number;
	b: number;
}

/**
 * Returns Obsidian's currently active theme accent color.
 *
 * The returned value is normalized to a hexadecimal color such as:
 *   #7f6df2
 */
export function getThemeAccentColor(): string {
	const accent = getComputedStyle(document.body)
		.getPropertyValue("--color-accent")
		.trim();

	if (!accent) {
		return "#7f6df2";
	}

	return cssColorToHex(accent) ?? "#7f6df2";
}

/**
 * Applies a lightness factor to a color.
 *
 * Examples:
 *   factor 1.0 -> unchanged
 *   factor 1.2 -> 20% lighter
 *   factor 0.8 -> 20% darker
 *
 * Lightness is adjusted in HSL color space.
 */
export function adjustColorLightness(
	color: string,
	factor: number,
): string {
	if (!Number.isFinite(factor) || factor < 0) {
		return color;
	}

	const rgb = cssColorToRgb(color);

	if (!rgb) {
		return color;
	}

	const hsl = rgbToHsl(rgb);

	hsl.l = clamp(hsl.l * factor, 0, 1);

	const adjustedRgb = hslToRgb(hsl.h, hsl.s, hsl.l);

	return rgbToHex(adjustedRgb);
}

/**
 * Converts any browser-supported CSS color into hexadecimal RGB.
 */
export function cssColorToHex(color: string): string | undefined {
	const rgb = cssColorToRgb(color);

	if (!rgb) {
		return undefined;
	}

	return rgbToHex(rgb);
}

/**
 * Uses the browser itself to resolve CSS colors such as:
 *
 *   #ff0000
 *   rgb(255, 0, 0)
 *   hsl(...)
 *   oklch(...)
 *
 * into ordinary RGB values.
 */
function cssColorToRgb(color: string): RGBColor | undefined {
	const element = document.createElement("span");

	element.style.color = "";
	element.style.color = color;

	if (!element.style.color) {
		return undefined;
	}

	element.style.display = "none";
	document.body.appendChild(element);

	const computed = getComputedStyle(element).color;

	element.remove();

	const match = computed.match(
		/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/,
	);

	if (!match) {
		return undefined;
	}

	return {
		r: clamp(Math.round(Number(match[1])), 0, 255),
		g: clamp(Math.round(Number(match[2])), 0, 255),
		b: clamp(Math.round(Number(match[3])), 0, 255),
	};
}

/**
 * Converts RGB to HSL.
 *
 * h, s and l are represented from 0 to 1.
 */
function rgbToHsl(rgb: RGBColor): {
	h: number;
	s: number;
	l: number;
} {
	const r = rgb.r / 255;
	const g = rgb.g / 255;
	const b = rgb.b / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);

	let h = 0;
	let s = 0;

	const l = (max + min) / 2;
	const delta = max - min;

	if (delta !== 0) {
		s =
			l > 0.5
				? delta / (2 - max - min)
				: delta / (max + min);

		switch (max) {
			case r:
				h = (g - b) / delta + (g < b ? 6 : 0);
				break;

			case g:
				h = (b - r) / delta + 2;
				break;

			case b:
				h = (r - g) / delta + 4;
				break;
		}

		h /= 6;
	}

	return { h, s, l };
}

/**
 * Converts an HSL color back to RGB.
 *
 * h, s and l are expected to be between 0 and 1.
 */
function hslToRgb(
	h: number,
	s: number,
	l: number,
): RGBColor {
	if (s === 0) {
		const gray = Math.round(l * 255);

		return {
			r: gray,
			g: gray,
			b: gray,
		};
	}

	const q =
		l < 0.5
			? l * (1 + s)
			: l + s - l * s;

	const p = 2 * l - q;

	const r = hueToRgb(p, q, h + 1 / 3);
	const g = hueToRgb(p, q, h);
	const b = hueToRgb(p, q, h - 1 / 3);

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
}

function hueToRgb(
	p: number,
	q: number,
	t: number,
): number {
	if (t < 0) {
		t += 1;
	}

	if (t > 1) {
		t -= 1;
	}

	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}

	if (t < 1 / 2) {
		return q;
	}

	if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}

	return p;
}

function rgbToHex(rgb: RGBColor): string {
	const toHex = (value: number): string =>
		clamp(Math.round(value), 0, 255)
			.toString(16)
			.padStart(2, "0");

	return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function clamp(
	value: number,
	min: number,
	max: number,
): number {
	return Math.min(Math.max(value, min), max);
}