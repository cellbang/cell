/* eslint no-eval: 0 */
/* eslint-disable @typescript-eslint/ban-ts-comment */

const path = '{{ path }}';
const entryMode = '{{ entryMode }}';
const port = parseInt('{{ port }}');
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port + '';
const serverlessExpress = require('@vendia/serverless-express');
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

export const handler = async (event: any, context: any, callback: any) => serverlessExpress({ app: await app })(event, context, callback);
