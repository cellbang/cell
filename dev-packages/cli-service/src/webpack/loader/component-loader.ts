import { LoaderDefinition } from 'webpack';
import { FRONTEND_TARGET } from '@malagu/cli-common/lib/constants';
import { Module } from '@malagu/cli-common/lib/package/package-protocol';
import { generateBackendComponents, generateFrontendComponents } from '../dynamic-container';

export interface ComponentLoaderOptions {
    target: string,
    registed: boolean,
    modules: Module[],
    staticModules: Module[]
}

const componentLoader: LoaderDefinition<ComponentLoaderOptions> = function (source, sourceMap) {
    const options = this.getOptions();
    const { target } = options;
    if (target === FRONTEND_TARGET) {
        this.callback(undefined, generateFrontendComponents(options), sourceMap);

    } else {
        this.callback(undefined, generateBackendComponents(options), sourceMap);
    }
};

export default componentLoader;
