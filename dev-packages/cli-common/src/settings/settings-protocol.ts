export interface Settings {
    defaultRuntime?: string;
    modeCommands?: { [key: string]: string[] };
    serveCommand?: string;
    compileCommands?: string[];
}

export const DEFAULT_SETTINGS = {
    modeCommands: {
        local: [ 'serve' ],
        remote: [ 'build', 'deploy', 'info' ],
    },
    serveCommand: 'serve',
    compileCommands: [ 'serve', 'build' ]
};
