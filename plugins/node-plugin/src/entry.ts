const path = '{{ path }}';
const port = parseInt('{{ port }}');
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port + '';
const app = require('{{ entry }}');
let target = app;
if (typeof app === 'object' && app.default) {
    target = app.default;
}
(async () => {
    if (target && typeof target.listen === 'function') {
        try {
            let server;
            if (target.server) {
                // view fastify issue: https://github.com/fastify/fastify/issues/1022
                server = target.server;
                // fastify listen function not return HTTP server instance, return the listening address
                await target.listen(port, '0.0.0.0');
            } else {
                // view doc: https://cloud.tencent.com/document/product/583/56124
                server = target.listen(port, '0.0.0.0');
            }
            server = target.listen(port);
            if (typeof server === 'object') {
                server.timeout = 0;
                server.keepAliveTimeout = 0;
            }
        } catch (error) {
            // NoOp
        }
    } else if (typeof target === 'function') {
        target(port);
    }
})();

