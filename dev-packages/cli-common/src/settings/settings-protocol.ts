export interface Settings {
    defaultRuntime?: string;
    modeCommands?: { [key: string]: string[] };
    serveCommand?: string;
    frameworks?: {
        url: string;
        upstreamUrl?: string;
    }
    compileCommands?: string[];
    configFileAlias?: string;
    banner?: string;
}

export const DEFAULT_SETTINGS = {
    modeCommands: {
        local: [ 'serve' ],
        remote: [ 'build', 'deploy', 'info' ],
    },
    serveCommand: 'serve',
    compileCommands: [ 'serve', 'build' ]
};
