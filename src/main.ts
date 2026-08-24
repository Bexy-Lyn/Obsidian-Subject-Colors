import { Notice, Plugin, MarkdownView, WorkspaceLeaf } from "obsidian";

import {
  DEFAULT_SETTINGS,
  SubjectColorSettings,
  SubjectColorSettingTab,
} from "./settings";
import { processThemePlaceholders } from "./renderer";
import { refreshMarkdownViewStyles } from "./viewStyling";

/**
 * Plugin lifecycle and registration
 */
export default class SubjectColorPlugin extends Plugin {
  settings!: SubjectColorSettings;

  async onload() {
    await this.loadSettings();

    this.addSettingTab(new SubjectColorSettingTab(this.app, this));

    this.registerMarkdownPostProcessor((element, context) => {
      processThemePlaceholders(this.app, element, context, this.settings);
    });

    this.app.workspace.onLayoutReady(() => {
      refreshMarkdownViewStyles(this.app, this.settings);
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        refreshMarkdownViewStyles(this.app, this.settings);
      }),
    );

    new Notice("Subject Color loaded");
  }

  onunload() {
    // Nothing to clean up yet.
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);

	await this.refreshViews();
  }

  async refreshViews(): Promise<void> {
    // Update Live Preview/editor styling.
    refreshMarkdownViewStyles(this.app, this.settings);

    // Rebuild visible Markdown views so Reading View
    // postprocessors run again.
    for (const leaf of this.app.workspace.getLeavesOfType("markdown")) {
      if (!(leaf.view instanceof MarkdownView)) {
        continue;
      }

      const rebuildableLeaf = leaf as WorkspaceLeaf & {
        rebuildView?: () => void;
      };

      rebuildableLeaf.rebuildView?.();
    }
  }
}
