/* eslint no-eval: 0 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
const path = '{{ path }}';
const entryMode = '{{ entryMode }}';
const port = parseInt('{{ port }}');
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port + '';
process.env.PORT = port + '';
let app: any;
try {
    // @ts-ignore
    if (entryMode === 'bundle') {
        app = require('{{ entry }}');
    } else {
        app = eval('require(\'{{ entry }}\')');
    }
} catch (e) {
    // @ts-ignore
    if (entryMode === 'module') {
        app = eval('import(\'{{ entry }}\')');
    }
}
(async () => {
    let server;
    let target = await app;
    if (typeof app === 'object' && app.default) {
        target = await app.default;
    }
    if (target && typeof target.listen === 'function') {
        try {
            // view doc: https://cloud.tencent.com/document/product/583/56124
            server = target.listen(port, '0.0.0.0');
            console.log(`serve ${port} success`);
            // view fastify issue: https://github.com/fastify/fastify/issues/1022
            server = target.server ?? server;
        } catch (error) {
            // NoOp
        }
    } else if (typeof target === 'function') {
        server = await target(port);
    }
    if (typeof server === 'object') {
        server.timeout = 0;
        server.keepAliveTimeout = 0;
    }
})();
