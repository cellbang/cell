export interface Settings {
    defaultRuntime?: string;
    defaultMode?: string[];
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
        dev: [ 'serve' ],
        build: [ 'build' ],
        local: [ 'build', 'deploy', 'info', 'rollout' ],
        remote: [ 'build', 'deploy', 'info', 'rollout' ],
    },
    serveCommand: 'serve',
    compileCommands: [ 'serve', 'build' ]
};
