import { LoaderDefinition } from 'webpack';

export interface ConfigLoaderOptions {
    source: string;
}

const configLoader: LoaderDefinition = function (source, sourceMap) {
    const options = this.getOptions() as ConfigLoaderOptions;
    this.callback(undefined, `exports.config = ${options.source};\n\n`, sourceMap);
};

export default configLoader;
