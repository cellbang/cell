import { loader } from 'webpack';

const configLoader: loader.Loader = function (source, sourceMap) {
    this.callback(undefined, `exports.config = ${this.query.source};\n\n`, sourceMap);
};

export default configLoader;
