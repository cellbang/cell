
import { bootstrap } from '../bootstrap';
import { ContainerUtil } from '@malagu/core';
import * as program from 'commander';
import { DeployManager } from './deploy-manager';

program
    .name('malagu deploy')
    .description('init a application')
    .parse(process.argv);

(async () => {
    await bootstrap();
    const deployManager = ContainerUtil.get<DeployManager>(DeployManager);
    await deployManager.deploy();
})();
