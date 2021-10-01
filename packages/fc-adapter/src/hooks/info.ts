import { CliContext } from '@malagu/cli-service';
import { Account, Credentials } from '@malagu/cloud';
import { FaaSAdapterUtils, DefaultProfileProvider } from '@malagu/faas-adapter/lib/hooks';
const FCClient = require('@alicloud/fc2');

const chalk = require('chalk');

let fcClient: any;

export default async (context: CliContext) => {

    const { cfg, pkg } = context;

    const adapterConfig = FaaSAdapterUtils.getConfiguration<any>(cfg);

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(adapterConfig);
    await createClients(adapterConfig, region, credentials, account);

    const { service, trigger } = adapterConfig;
    const functionMeta = adapterConfig.function;
    const serviceName = service.name;
    const functionName = functionMeta.name;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of Function Compute...`);
    console.log(chalk`{bold.cyan - FC:}`);

    try {
        const functionInfo = await fcClient.getFunction(serviceName, functionName);

        console.log(`    - FunctionName : ${functionInfo.data.functionName}`);
        console.log(`    - Timeout : ${functionInfo.data.timeout}`);
        console.log(`    - lastModifiedTime : ${functionInfo.data.lastModifiedTime}`);

    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            console.log('No Fuction Found');
        } else {
            throw ex;
        }
    }

    if (trigger.triggerType === 'http') {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        console.log(`    - Methods: ${trigger.triggerConfig.methods}`);
        console.log(chalk`    - Url: ${chalk.green.bold(
            `https://${account.id}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${trigger.qualifier}/${functionName}/`)}`);

    }

    console.log();
    console.log('Finished');
    console.log();

};

async function createClients(adapterConfig: any, region: string, credentials: Credentials, account: Account) {
    fcClient = new FCClient(account.id, {
        accessKeyID: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.token,
        region,
        timeout: adapterConfig.timeout,
        secure: adapterConfig.secure,
        internal: adapterConfig.internal
    });

}

