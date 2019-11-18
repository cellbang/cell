function is(userAgent: string, platform: string): boolean {
    if (typeof navigator !== 'undefined') {
        if (navigator.userAgent && navigator.userAgent.indexOf(userAgent) >= 0) {
            return true;
        }
    }
    if (typeof process !== 'undefined') {
        return (process.platform === platform);
    }
    return false;
}

export const isWindows = is('Windows', 'win32');
export const isOSX = is('Mac', 'darwin');

export type CMD = [string, string[]];
export function cmd(command: string, ...args: string[]): CMD {
    return [
        isWindows ? 'cmd' : command,
        isWindows ? ['/c', command, ...args] : args
    ];
}

export namespace OS {

    /**
     * Enumeration of the supported operating systems.
     */
    export enum Type {
        Windows = 'Windows',
        Linux = 'Linux',
        OSX = 'OSX'
    }

    /**
     * Returns with the type of the operating system. If it is neither [Windows](isWindows) nor [OS X](isOSX), then
     * it always return with the `Linux` OS type.
     */
    export function type(): OS.Type {
        if (isWindows) {
            return Type.Windows;
        }
        if (isOSX) {
            return Type.OSX;
        }
        return Type.Linux;
    }

}
