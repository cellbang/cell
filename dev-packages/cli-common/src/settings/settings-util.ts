import { load, dump } from 'js-yaml';
import { readFileSync, existsSync, ensureFileSync, writeFileSync } from 'fs-extra';
import { getMalaguHomePath } from '../util';
import * as path from 'path';
import { DEFAULT_SETTINGS, Settings } from './settings-protocol';
import mergeWith = require('lodash.mergewith');
import { customizer } from '../package/package-protocol';

export namespace SettingsUtil {
    export function getSettingsPath() {
        return path.join(getMalaguHomePath(), 'settings.yml');
    }

    function doGetSettings(): Settings {
        const settingsPath = getSettingsPath();
        if (existsSync(settingsPath)) {
            const content = readFileSync(settingsPath, 'utf8');
            return load(content) || {};
        }
        return {};
    }

    export function getSettings(): Settings {
        return { ...DEFAULT_SETTINGS, ...doGetSettings() };
    }

    export function updateSettings(parts: Record<string, any>) {
        let settings = doGetSettings();
        settings = mergeWith(settings, parts, customizer);
        saveSettings(settings);
    }

    export function saveSettings(settings: Settings) {
        const settingsPath = getSettingsPath();
        ensureFileSync(settingsPath);
        writeFileSync(settingsPath, dump(settings), { encoding: 'utf8' });
    }
}
