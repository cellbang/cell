import { LoaderDefinition } from 'webpack';

export interface ConfigLoaderOptions {
    source: string;
}

const configLoader: LoaderDefinition<ConfigLoaderOptions> = function (source, sourceMap) {
    const options = this.getOptions();
    this.callback(undefined, `exports.config = ${options.source};\n\n`, sourceMap);
};

export default configLoader;
