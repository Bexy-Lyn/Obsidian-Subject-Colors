# Obsidian Fancy Colors Plugin

This plugin evolved from a small tweak I wanted to add to my study notes - colour coding. For anybody, who delights in having visual differentiation between topics, this might be for you as well.

## Functions
- Assign colors to tags in your vault. The first tag in a note that has an assigned color determines that note's theme color.
- If no colour is specified, the theme's accent colour will be used as fallback.
- Optionally style headlines, dividers and notes in your theme's colour as well.

## Usage
Apply the colour wherever you want in the regular markup, i.e. as style attributes to HTML elements with the shortcode `[theme]`. You can even automatically lighten or darken the colour to inluence the contrast, by adding a factor as optional parameter. I.e. `[theme/1.2]` will lighten the colour by 20%, while `[theme/0.8]` darkens it.

Example:

```html
<span style="backgroundColor:[theme/1.8],color:[theme/0.4],padding:1rem">I will appear styled in the file's theme colour!</span>
```

## Please note
Due to the nature of the live preview, the theme colours as of now don't show up in HTML elements until the file is opened in the reading view. 