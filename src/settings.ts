import { App, PluginSettingTab, Setting } from "obsidian";
import SubjectColorPlugin from "./main";
import { getThemeAccentColor } from "./colors";
import { getVaultTags } from "./tags";

export interface SubjectColorSettings {
  tagColors: Record<string, string>;
}

export const DEFAULT_SETTINGS: SubjectColorSettings = {
  tagColors: {},
};

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
      const isEnabled = assignedColor !== undefined;

      const setting = new Setting(containerEl)
        .setName(tag)
        .setDesc(
          isEnabled ? `Assigned color: ${assignedColor}` : "No color assigned.",
        );

      setting.addToggle((toggle) => {
        toggle.setValue(isEnabled);

        toggle.onChange(async (enabled) => {
          if (enabled) {
            const color = getThemeAccentColor();

            this.plugin.settings.tagColors[tag] = color;
            await this.plugin.saveSettings();

            setting.setDesc(`Assigned color: ${color}`);

            this.display();
          } else {
            delete this.plugin.settings.tagColors[tag];
            await this.plugin.saveSettings();

            setting.setDesc("No color assigned.");

            this.display();
          }
        });
      });

      setting.addColorPicker((colorPicker) => {
        colorPicker.setValue(assignedColor ?? getThemeAccentColor());

        colorPicker.setDisabled(!isEnabled);

        colorPicker.onChange(async (value) => {
          this.plugin.settings.tagColors[tag] = value;
          await this.plugin.saveSettings();

          setting.setDesc(`Assigned color: ${value}`);
        });
      });
    }
  }
}
