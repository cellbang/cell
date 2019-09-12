import { loader } from 'webpack';
import { FRONTEND_TARGET } from '../../constants';

function generateImports(modules: string[], fn: 'import' | 'require'): string {
    let targetModules: string[] = [];
    targetModules = modules.map((m: string) => {
        if (fn === 'require') {
            return `Promise.resolve(require('${m}'))`;
        }
        return `${fn}('${m}')`;
    });
    return targetModules.map(m => `then(function () { return ${m}.then(load) })`).join('.\n');
}

function generateFrontendComponents(modules: string[]) {
    return `
require('es6-promise/auto');
require('reflect-metadata');
const { Container } = require('inversify');
const { FrontendApplication } = require('@malagu/core/lib/browser');
const { CoreFrontendModule } = require('@malagu/core/lib/browser/frontend-module');
const { CONFIG } = require('@malagu/core/lib/common/config-provider');
const config = process.env;

const container = new Container();
container.load(CoreFrontendModule);
window[CONFIG] = config;

function load(raw) {
  return Promise.resolve(raw.default).then(module => container.load(module));
}

module.exports.container = Promise.resolve()
  .${generateImports(modules, 'import')}
  .then(() => container).catch(reason => {
    console.error('Failed to start the frontend application.');
    if (reason) {
      console.error(reason);
    }
  });`;
}

function generateBackendComponents(modules: string[]) {
    return `
require('reflect-metadata');
const { Container } = require('inversify');
const { CoreBackendModule } = require('@malagu/core/lib/node/backend-module');
require('source-map-support').install();

const container = new Container();
container.load(CoreBackendModule);

function load(raw) {
  return Promise.resolve(raw.default).then(module => container.load(module));
}

module.exports.container = Promise.resolve()
  .${generateImports(modules, 'require')}
  .then(() => container).catch(reason => {
	  console.error('Failed to start the backend application.');
    if (reason) {
      console.error(reason);
    }
  });`;
}

const componentLoader: loader.Loader = function (source, sourceMap) {
    const { target, modules } = this.query;
    if (target === FRONTEND_TARGET) {
        this.callback(undefined, `
        ${source}
        ${generateFrontendComponents(modules)}
        `, sourceMap);

    } else {
        this.callback(undefined, `
        ${source}
        ${generateBackendComponents(modules)}
        `, sourceMap);
    }
};

export default componentLoader;
