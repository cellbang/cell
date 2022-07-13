const fs = require('fs');
const path = require('path');

const installScriptPath = path.resolve(__dirname, '..', 'lib', 'install.js');

if (fs.existsSync(installScriptPath)) {
    require(installScriptPath);
}
