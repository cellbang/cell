import { execSync } from 'child_process';
import { existsSync } from 'fs-extra';
const path = require('path');
const LRU = require('lru-cache');
const semver = require('semver');

let _hasYarn: boolean;
const _yarnProjects = new LRU({
    max: 10,
    maxAge: 1000
});
let _hasGit = false;
const _gitProjects = new LRU({
    max: 10,
    maxAge: 1000
});

// env detection
export const hasYarn = () => {
    if (_hasYarn !== undefined) {
        return _hasYarn;
    }
    try {
        execSync('yarn --version', { stdio: 'ignore' });
        _hasYarn = true;
        return _hasYarn;
    } catch (e) {
        _hasYarn = false;
        return _hasYarn = false;
    }
};

export const hasProjectYarn = (cwd: string) => {
    if (_yarnProjects.has(cwd)) {
        return checkYarn(_yarnProjects.get(cwd));
    }

    const lockFile = path.join(cwd, 'yarn.lock');
    const result = existsSync(lockFile);
    _yarnProjects.set(cwd, result);
    return checkYarn(result);
};

function checkYarn(result: boolean) {
    if (result && !exports.hasYarn()) {
        throw new Error('The project seems to require yarn but it\'s not installed.');
    }
    return result;
}

export const hasGit = () => {
    if (_hasGit !== undefined) {
        return _hasGit;
    }
    try {
        execSync('git --version', { stdio: 'ignore' });
        _hasGit = true;
        return _hasGit;
    } catch (e) {
        _hasGit = false;
        return _hasGit;
    }
};

export const hasProjectGit = (cwd: string) => {
    if (_gitProjects.has(cwd)) {
        return _gitProjects.get(cwd);
    }

    let result: boolean;
    try {
        execSync('git status', { stdio: 'ignore', cwd });
        result = true;
    } catch (e) {
        result = false;
    }
    _gitProjects.set(cwd, result);
    return result;
};

let _hasPnpm: boolean;
let _pnpmVersion: string;
const _pnpmProjects = new LRU({
    max: 10,
    maxAge: 1000
});

function getPnpmVersion() {
    if (_pnpmVersion !== undefined) {
        return _pnpmVersion;
    }
    try {
        _pnpmVersion = execSync('pnpm --version', {
            stdio: ['pipe', 'pipe', 'ignore']
        }).toString();
        // there's a critical bug in pnpm 2
        // https://github.com/pnpm/pnpm/issues/1678#issuecomment-469981972
        // so we only support pnpm >= 3.0.0
        _hasPnpm = true;
    } catch (e) { }
    return _pnpmVersion || '0.0.0';
}

export const hasPnpmVersionOrLater = (version: string) => semver.gte(getPnpmVersion(), version);

export const hasPnpm3OrLater = () => hasPnpmVersionOrLater('3.0.0');

export const hasProjectPnpm = (cwd: string) => {
    if (_pnpmProjects.has(cwd)) {
        return checkPnpm(_pnpmProjects.get(cwd));
    }

    const lockFile = path.join(cwd, 'pnpm-lock.yaml');
    const result = existsSync(lockFile);
    _pnpmProjects.set(cwd, result);
    return checkPnpm(result);
};

function checkPnpm(result: boolean) {
    if (result && !exports.hasPnpm3OrLater()) {
        throw new Error(`The project seems to require pnpm${_hasPnpm ? ' >= 3' : ''} but it's not installed.`);
    }
    return result;
}

const _npmProjects = new LRU({
    max: 10,
    maxAge: 1000
});
export const hasProjectNpm = (cwd: string) => {
    if (_npmProjects.has(cwd)) {
        return _npmProjects.get(cwd);
    }

    const lockFile = path.join(cwd, 'package-lock.json');
    const result = existsSync(lockFile);
    _npmProjects.set(cwd, result);
    return result;
};

// OS
export const isWindows = process.platform === 'win32';
export const isMacintosh = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';

const browsers: { chrome?: string, firefox?: string } = {};
let hasCheckedBrowsers = false;

function tryRun(cmd: string) {
    try {
        return execSync(cmd, {
            stdio: [0, 'pipe', 'ignore'],
            timeout: 10000
        }).toString().trim();
    } catch (e) {
        return '';
    }
}

function getLinuxAppVersion(binary: string) {
    return tryRun(`${binary} --version`).replace(/^.* ([^ ]*)/g, '$1');
}

function getMacAppVersion(bundleIdentifier: string) {
    const bundlePath = tryRun(`mdfind "kMDItemCFBundleIdentifier=='${bundleIdentifier}'"`);

    if (bundlePath) {
        return tryRun(`/usr/libexec/PlistBuddy -c Print:CFBundleShortVersionString ${bundlePath.replace(/(\s)/g, '\\ ')
            }/Contents/Info.plist`);
    }
}

export const getInstalledBrowsers = () => {
    if (hasCheckedBrowsers) {
        return browsers;
    }
    hasCheckedBrowsers = true;

    if (exports.isLinux) {
        browsers.chrome = getLinuxAppVersion('google-chrome');
        browsers.firefox = getLinuxAppVersion('firefox');
    } else if (exports.isMacintosh) {
        browsers.chrome = getMacAppVersion('com.google.Chrome');
        browsers.firefox = getMacAppVersion('org.mozilla.firefox');
    } else if (exports.isWindows) {
        // get chrome stable version
        // https://stackoverflow.com/a/51773107/2302258
        const chromeQueryResult = tryRun(
            'reg query "HKLM\\Software\\Google\\Update\\Clients\\{8A69D345-D564-463c-AFF1-A69D9E530F96}" /v pv /reg:32'
        ) || tryRun(
            'reg query "HKCU\\Software\\Google\\Update\\Clients\\{8A69D345-D564-463c-AFF1-A69D9E530F96}" /v pv /reg:32'
        );
        if (chromeQueryResult) {
            const matched = chromeQueryResult.match(/REG_SZ\s+(\S*)$/);
            if (matched) {
                browsers.chrome = matched[1];
            }
        }

        // get firefox version
        // https://community.spiceworks.com/topic/111518-how-to-determine-version-of-installed-firefox-in-windows-batchscript
        const ffQueryResult = tryRun(
            'reg query "HKLM\\Software\\Mozilla\\Mozilla Firefox" /v CurrentVersion'
        );
        if (ffQueryResult) {
            const matched = ffQueryResult.match(/REG_SZ\s+(\S*)$/);
            if (matched) {
                browsers.firefox = matched[1];
            }
        }
    }

    return browsers;
};
