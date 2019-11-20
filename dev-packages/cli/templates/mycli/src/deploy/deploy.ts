
import 'reflect-metadata';
require('source-map-support').install();
import * as program from 'commander';
import { Container } from 'inversify';
import { CoreBackendModule } from '@malagu/core/lib/node/module';
import { MycliModule } from '../module';
import { DeployManager } from './deploy-manager';

program
    .name('malagu deploy')
    .description('init a application')
    .parse(process.argv);

(async () => {
    const container = new Container();
    container.load(CoreBackendModule, MycliModule);
    const deployManager = container.get(DeployManager);
    await deployManager.deploy();
})();
