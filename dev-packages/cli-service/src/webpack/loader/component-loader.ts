import { loader } from 'webpack';
import { FRONTEND_TARGET } from '@malagu/cli-common';
import { generateBackendComponents, generateFrontendComponents } from '../dynamic-container';

const componentLoader: loader.Loader = function (source, sourceMap) {
    const { target } = this.query;
    if (target === FRONTEND_TARGET) {
        this.callback(undefined, generateFrontendComponents(this.query), sourceMap);

    } else {
        this.callback(undefined, generateBackendComponents(this.query), sourceMap);
    }
};

export default componentLoader;
