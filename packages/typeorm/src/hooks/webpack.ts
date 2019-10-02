import { HookContext, BACKEND_TARGET } from '@malagu/cli';
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

export default (context: HookContext) => {
    const { configurations } = context;
    for (const c of configurations) {
        if (c.name === BACKEND_TARGET) {
            c.plugins = c.plugins || [];
            c.plugins.push(new FilterWarningsPlugin({
                exclude: [/mongodb/, /mssql/, /mysql/, /oracledb/, /pg/, /pg-native/, /pg-query-stream/,
                    /redis/, /sqlite3/, /eact-native-sqlite-storage/, /cli-highlight/, /Critical dependency/]
            }));
            c.optimization = {
                minimize: false,
            };
        }
    }
};
