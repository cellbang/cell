import { Component } from '@malagu/core';
import * as chalk from 'chalk';


@Component()
export class DeployManager {

    async deploy(): Promise<void> {
        console.log(chalk`{bold.green Success!}`);
    }

}
