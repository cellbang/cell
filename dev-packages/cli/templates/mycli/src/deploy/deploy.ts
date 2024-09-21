
import { bootstrap } from '../bootstrap';
import { ContainerUtil } from '@celljs/core';
import * as program from 'commander';
import { DeployManager } from './deploy-manager';

program
    .name('cell deploy')
    .description('init a application')
    .parse(process.argv);

(async () => {
    await bootstrap();
    const deployManager = ContainerUtil.get<DeployManager>(DeployManager);
    await deployManager.deploy();
})();
