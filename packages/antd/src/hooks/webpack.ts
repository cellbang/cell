import { HookContext, FRONTEND_TARGET, getMalaguConfig } from '@malagu/cli';

export default (ctx: HookContext) => {
    const { pkg, configurations } = ctx;
    const c = HookContext.getConfiguration(FRONTEND_TARGET, configurations);
    if (c) {
        const config = getMalaguConfig(pkg, FRONTEND_TARGET);

        // c.module?.rules.push({
        //     test: /\.(js|jsx)$/,
        //     exclude: /(node_modules|bower_components)/,
        //     use: {
        //         loader: 'babel-loader',
        //         options: {
        //             plugins: [['import', {
        //                 libraryName: 'antd',
        //                 libraryDirectory: 'lib',
        //                 style: true
        //             }]]
        //         }
        //     }
        // });

        c.module?.rules.push({
            test: /\.less$/,
            use: [{
                loader: 'style-loader',
            }, {
                loader: 'css-loader',
            }, {
                loader: 'less-loader',
                options: {
                    modifyVars: config.antd ? config.antd.themeOptions : {},
                    javascriptEnabled: true,
                }
            }]
        });
    }

};
