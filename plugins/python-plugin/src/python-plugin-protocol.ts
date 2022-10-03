export interface PythonPluginOptions {
    requirementsFile?: string;
    usePoetry: boolean;
    usePipenv: boolean;
    externals: string[];
    cacheLocation: string;
    useStaticCache: boolean;
    staticCacheMaxVersions: number;
    vendor?: string;
    pythonBin: string;
    pipCmdExtraArgs: string[];
    dockerizePip: boolean;
    useDownloadCache: boolean;
    dockerFile?: string;
    dockerBuildCmdExtraArgs: string[];
    dockerImage?: string;
    dockerSsh?: boolean;
    dockerPrivateKey?: string;
    dockerEnv?: { [key: string]: string };
    dockerExtraFiles: string[];
    dockerRunCmdExtraArgs: string[];
    slim: boolean;
    strip: boolean;
    slimPatternsAppendDefaults: boolean;
    slimPatterns: string[];
    layer: boolean;
    codePatterns: string[];
}

export const DEFAULT_PYTHON_PLUGIN_OPTIONS = {
    requirementsFile: 'requirements.txt',
    pipCmdExtraArgs: [],
    dockerBuildCmdExtraArgs: [],
    dockerExtraFiles: [],
    dockerRunCmdExtraArgs: [],
    externals: [],
    usePipenv: true,
    usePoetry: true,
    pythonBin: process.platform === 'win32' ? 'python.exe' : 'python',
    useStaticCache: true,
    useDownloadCache: true,
    staticCacheMaxVersions: 0,
    codePatterns: [],
    slim: false,
    strip: false,
    slimPatternsAppendDefaults: false
};
