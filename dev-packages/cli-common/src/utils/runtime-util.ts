const pkg = require('../../package.json');

export namespace RuntimeUtil {

    export function getVersion() {
        return pkg.version;
    }

}
