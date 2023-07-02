export namespace UrlUtil {
    export function join(...paths: string[]) {
        const resultArray = [];
        if (paths.length === 0) {
            return '';
        }

        if (typeof paths[0] !== 'string') {
            throw new TypeError('Url must be a string. Received ' + paths[0]);
        }

        // If the first part is a plain protocol, we combine it with the next part.
        if (paths[0].match(/^[^/:]+:\/*$/) && paths.length > 1) {
            paths[0] = paths.shift() + paths[0];
        }

        // There must be two or three slashes in the file protocol, two slashes in anything else.
        if (paths[0].match(/^file:\/\/\//)) {
            paths[0] = paths[0].replace(/^([^/:]+):\/*/, '$1:///');
        } else {
            paths[0] = paths[0].replace(/^([^/:]+):\/*/, '$1://');
        }

        for (let i = 0; i < paths.length; i++) {
            let component = paths[i];

            if (typeof component !== 'string') {
                throw new TypeError(
                    'Url must be a string. Received ' + component
                );
            }

            if (component === '') {
                continue;
            }

            if (i > 0) {
                // Removing the starting slashes for each component but the first.
                component = component.replace(/^[\/]+/, '');
            }
            if (i < paths.length - 1) {
                // Removing the ending slashes for each component but the last.
                component = component.replace(/[\/]+$/, '');
            } else {
                // For the last component we will combine multiple slashes to a single one.
                component = component.replace(/[\/]+$/, '/');
            }

            resultArray.push(component);
        }

        let str = resultArray.join('/');
        // Each input component is now separated by a single slash except the possible first plain protocol part.

        // remove trailing slash before parameters or hash
        str = str.replace(/\/(\?|&|#[^!])/g, '$1');

        // replace ? in parameters with &
        const parts = str.split('?');
        str = parts.shift() + (parts.length > 0 ? '?' : '') + parts.join('&');

        return str;
    }
}
