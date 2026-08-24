import { App, PluginSettingTab, Setting, SettingGroup } from "obsidian";
import SubjectColorPlugin from "./main";
import { getThemeAccentColor } from "./colors";
import { getVaultTags } from "./tags";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface SubjectColorSettings {
  tagColors: Record<string, string>;

  headingColorLevels: HeadingLevel[];
  headingUnderlineLevels: HeadingLevel[];

  themeDividers: boolean;
  themeStandardCallouts: boolean;
}

export const DEFAULT_SETTINGS: SubjectColorSettings = {
  tagColors: {},

  headingColorLevels: [],
  headingUnderlineLevels: [],

  themeDividers: false,
  themeStandardCallouts: false,
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

    new SettingGroup(containerEl).setHeading("Note styling");

    const headingColorSetting = new Setting(containerEl)
      .setName("Colored headings")
      .setDesc(
        "Choose which heading levels should use the note's theme color.",
      );

    this.addHeadingLevelButtons(
      headingColorSetting,
      this.plugin.settings.headingColorLevels,
      async (levels) => {
        this.plugin.settings.headingColorLevels = levels;
        await this.plugin.saveSettings();

        this.display();
      },
    );

    const headingUnderlineSetting = new Setting(containerEl)
      .setName("Underlined headings")
      .setDesc(
        "Choose which heading levels should receive a theme-colored underline.",
      );

    this.addHeadingLevelButtons(
      headingUnderlineSetting,
      this.plugin.settings.headingUnderlineLevels,
      async (levels) => {
        this.plugin.settings.headingUnderlineLevels = levels;
        await this.plugin.saveSettings();

        this.display();
      },
    );

    new Setting(containerEl)
      .setName("Theme horizontal dividers")
      .setDesc(
        "Render horizontal dividers using a translucent version of the note's theme color.",
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.themeDividers)
          .onChange(async (value) => {
            this.plugin.settings.themeDividers = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Theme standard callouts")
      .setDesc(
        "Use the note's theme color for ordinary informational callouts. Warning, danger, error, failure, bug, and other status callouts keep their original colors.",
      )
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.themeStandardCallouts)
          .onChange(async (value) => {
            this.plugin.settings.themeStandardCallouts = value;
            await this.plugin.saveSettings();
          });
      });

	  containerEl.createEl("hr");

    new SettingGroup(containerEl).setHeading("Tag colors");
	
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

  private addHeadingLevelButtons(
    setting: Setting,
    selectedLevels: HeadingLevel[],
    onChange: (levels: HeadingLevel[]) => Promise<void>,
  ): void {
    const levels: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

    for (const level of levels) {
      setting.addButton((button) => {
        button.setButtonText(`H${level}`);

        if (selectedLevels.includes(level)) {
          button.setCta();
        }

        button.onClick(async () => {
          let newLevels: HeadingLevel[];

          if (selectedLevels.includes(level)) {
            newLevels = selectedLevels.filter(
              (currentLevel) => currentLevel !== level,
            );
          } else {
            newLevels = [...selectedLevels, level].sort((a, b) => a - b);
          }

          await onChange(newLevels);
        });
      });
    }
  }
}
