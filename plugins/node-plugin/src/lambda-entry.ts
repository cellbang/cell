const path = '{{ path }}';
const entryMode: string = '{{ entryMode }}';
const port = parseInt('{{ port }}');
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port + '';
const serverlessExpress = require('@vendia/serverless-express');
let app: any;
try {
    if (entryMode === 'bundle') {
        app = require('{{ entry }}');
    } else {
        app = eval(`require('{{ entry }}')`);
    }
} catch (e) {
    if (entryMode === 'module') {
        app = eval(`import('{{ entry }}')`);
    }
}

export const handler = async (event: any, context: any, callback: any) => {
  return serverlessExpress({ app: await app })(event, context, callback);
};
