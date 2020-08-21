import { loader } from 'webpack';
import { FRONTEND_TARGET } from '../../constants';

interface Context {
  target: string;
  registed: boolean;
  modules: string[];

}

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

function generateFrontendComponents(context: Context) {
    const { modules, registed } = context;
    return `
require('es6-promise/auto');
require('reflect-metadata');
const { Container } = require('inversify');
const { FrontendApplication } = require('@malagu/core/lib/browser');
const { CoreFrontendModule } = require('@malagu/core/lib/browser/module');

const container = new Container();
container.load(CoreFrontendModule);

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
  });` + (registed ?
  `if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const href = document.getElementsByTagName('base')[0].href;
      navigator.serviceWorker.register(href + 'service-worker.js' + '?${new Date().getTime()}').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }` : '');
}

function generateBackendComponents(context: Context) {
    const { modules } = context;
    return `
require('reflect-metadata');
const { Container } = require('inversify');
const { CoreBackendModule } = require('@malagu/core/lib/node/module');
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
    const { target } = this.query;
    if (target === FRONTEND_TARGET) {
        this.callback(undefined, `
        ${source}
        ${generateFrontendComponents(this.query)}
        `, sourceMap);

    } else {
        this.callback(undefined, `
        ${source}
        ${generateBackendComponents(this.query)}
        `, sourceMap);
    }
};

export default componentLoader;
