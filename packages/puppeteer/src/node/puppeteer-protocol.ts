import { Browser, LaunchOptions } from 'puppeteer-core';

export const BrowserProvider = Symbol('BrowserProvider');
export const BrowserInstaller = Symbol('BrowserInstaller');

export interface PuppeteerConfig {
    launchOptions: LaunchOptions;
    bucket: string;
    object: string;
    internal: boolean;
    accessKeyId: string;
    accessKeySecret: string;
    stsToken?: string;
    region: string;
    setupPath: string;
    debug: boolean;
    libPath: string;
}

export interface BrowserProvider {
    provide(): Promise<Browser>;
}

export interface BrowserInstaller {
    install(): Promise<LaunchOptions>;
}
