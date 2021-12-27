const path = '{{ path }}';
const port = parseInt('{{ port }}');
process.env.SERVER_PATH = path;
process.env.SERVER_PORT = port + '';
const awsLambdaFastify = require('aws-lambda-fastify');
const appPromise = require('{{ entry }}');

export const handler = async (event: any, context: any, callback: any) => {
  const app = await appPromise;
  return awsLambdaFastify(app)(event, context, callback);
};
