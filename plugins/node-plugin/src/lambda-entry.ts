const path = '{{ path }}';
const port = parseInt('{{ port }}');
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port + '';
const serverlessExpress = require('@vendia/serverless-express');
const appPromise = require('{{ entry }}');

export const handler = async (event: any, context: any, callback: any) => {
  const app = await appPromise;
  return serverlessExpress({ app })(event, context, callback);
};
