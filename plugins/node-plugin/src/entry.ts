const path = '{{ path }}';
const port = parseInt('{{ port }}');
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port + '';
const app = require('{{ entry }}');
let target = app;
if (typeof app === 'object' && app.default) {
    target = app.default;
}
if (target && typeof target.listen === 'function') {
    try {
        const server = target.listen(port);
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
