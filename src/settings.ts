import { App, PluginSettingTab, Setting } from "obsidian";
import SubjectColorPlugin from "./main";
import { getVaultTags } from "./tags";

export interface SubjectColorSettings {
  tagColors: Record<string, string>;
}

export const DEFAULT_SETTINGS: SubjectColorSettings = {
  tagColors: {},
};

function getThemeAccentColor(): string {
  const accent = getComputedStyle(document.body)
    .getPropertyValue("--color-accent")
    .trim();

  return accent || "#7f6df2";
}

/**
 * Settings UI and persisted data.
 */
export class SubjectColorSettingTab extends PluginSettingTab {
  plugin: SubjectColorPlugin;

  constructor(app: App, plugin: SubjectColorPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl).setName("Subject colors").setHeading();

    containerEl.createEl("p", {
      text: "Assign colors to tags in your vault. The first tag in a note that has an assigned color determines that note's theme color.",
    });

    const tags = getVaultTags(this.app);

    if (tags.length === 0) {
      new Setting(containerEl)
        .setName("No tags found")
        .setDesc("Add tags to your notes and reopen this settings page.");

      return;
    }

    for (const tag of tags) {
      const assignedColor = this.plugin.settings.tagColors[tag];

      const setting = new Setting(containerEl)
        .setName(tag)
        .setDesc(
          assignedColor
            ? `Assigned color: ${assignedColor}`
            : "No color assigned.",
        );

      setting.addColorPicker((colorPicker) => {
        colorPicker.setValue(assignedColor ?? getThemeAccentColor());

        colorPicker.onChange(async (value) => {
          this.plugin.settings.tagColors[tag] = value;

          await this.plugin.saveSettings();

          setting.setDesc(`Assigned color: ${value}`);
        });
      });
    }
  }
}
