import { load, dump } from 'js-yaml';
import { readFileSync, existsSync, ensureFileSync, writeFileSync } from 'fs-extra';
import { PathUtil } from '../utils/path-util';
import { ConfigUtil } from '../utils/config-util';
import * as path from 'path';
import { DEFAULT_SETTINGS, Settings } from './settings-protocol';

export namespace SettingsUtil {
    export function getSettingsPath() {
        return process.env.MALAGU_SETTINGS_PATH ? process.env.MALAGU_SETTINGS_PATH : path.join(PathUtil.getCellHomePath(), 'settings.yml');
    }

    function doGetSettings(): Settings {
        const settingsPath = getSettingsPath();
        if (existsSync(settingsPath)) {
            const content = readFileSync(settingsPath, { encoding: 'utf8' });
            return load(content) as any || {};
        }
        return {};
    }

    export function getSettings(): Settings {
        return { ...DEFAULT_SETTINGS, ...doGetSettings() };
    }

    export function updateSettings(parts: Record<string, any>) {
        let settings = doGetSettings();
        settings = ConfigUtil.merge(settings, parts);
        saveSettings(settings);
    }

    export function resetSettings(parts: Record<string, any>) {
        let settings = doGetSettings();
        settings = { ...settings, ...parts };
        saveSettings(settings);
    }

    export function saveSettings(settings: Settings) {
        const settingsPath = getSettingsPath();
        ensureFileSync(settingsPath);
        writeFileSync(settingsPath, dump(settings), { encoding: 'utf8' });
    }
}
