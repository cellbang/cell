import { WebpackContext, BACKEND_TARGET } from '@malagu/cli';
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

export default (context: WebpackContext) => {
    const { configurations } = context;
    for (const c of configurations) {
        if (c.name === BACKEND_TARGET) {
            c.plugins = c.plugins || [];
            c.plugins.push(new FilterWarningsPlugin({
                exclude: [/Critical dependency: the request of a dependency is an expression/]
            }));
        }
    }
};
