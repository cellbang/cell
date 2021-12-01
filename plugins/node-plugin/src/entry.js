const app = require('./_index');
let target = app;
if (typeof app === 'object' && app.default) {
    target = app.default;
}
if (typeof target === 'function') {
    if (typeof target.listen === 'funtion') {
        target.listen(PORT);
    } else {
        target(PORT);
    }
}

