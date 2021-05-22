import { LoaderDefinition } from 'webpack';
import { FRONTEND_TARGET } from '@malagu/cli-common';
import { generateBackendComponents, generateFrontendComponents } from '../dynamic-container';

export interface ComponentLoaderOptions {
    target: string,
    registed: boolean,
    modules: string[],
    staticModules: string[]
}

const componentLoader: LoaderDefinition<{}> = function (source, sourceMap) {
    const options = this.getOptions() as ComponentLoaderOptions;
    const { target } = options;
    if (target === FRONTEND_TARGET) {
        this.callback(undefined, generateFrontendComponents(options), sourceMap);

    } else {
        this.callback(undefined, generateBackendComponents(options), sourceMap);
    }
};

export default componentLoader;
