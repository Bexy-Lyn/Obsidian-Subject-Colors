import { Notice, Plugin } from "obsidian";

export default class SubjectColorPlugin extends Plugin {
	async onload() {
		new Notice("Subject Color loaded");
	}

	onunload() {
		// Nothing to clean up yet.
	}
}