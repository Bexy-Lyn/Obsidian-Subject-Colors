import { Notice, Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	SubjectColorSettings,
	SubjectColorSettingTab,
} from "./settings";

/**
 * Plugin lifecycle and registration
 */
export default class SubjectColorPlugin extends Plugin {
	settings!: SubjectColorSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new SubjectColorSettingTab(this.app, this));

		new Notice("Subject Color loaded");
	}

	onunload() {
		// Nothing to clean up yet.
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}