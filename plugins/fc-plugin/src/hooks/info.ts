import { CliContext } from '@malagu/cli-service';
import { Account, Credentials } from '@malagu/cloud';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
const FCClient = require('@alicloud/fc2');
const CloudAPI = require('@alicloud/cloudapi');
const chalk = require('chalk');

let fcClient: any;
let apiClient: any;

export default async (context: CliContext) => {

    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const faasConfig = cloudConfig.faas;

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(cloudConfig);
    await createClients(faasConfig, region, credentials, account);

    const { service, trigger, apiGateway } = faasConfig;
    const functionMeta = faasConfig.function;
    const serviceName = service.name;
    const functionName = functionMeta.name;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - FC:}`);

    try {
        const functionInfo = await fcClient.getFunction(serviceName, functionName);

        console.log(`    - FunctionName : ${functionInfo.data.functionName}`);
        console.log(`    - Timeout : ${functionInfo.data.timeout}`);
        console.log(`    - LastModifiedTime : ${functionInfo.data.lastModifiedTime}`);

    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            console.log('No Fuction Found');
        } else {
            throw ex;
        }
    }

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const { api } = apiGateway;
        const apiGatewayList = await getApiGatwayList(api);
        if (apiGatewayList.length > 1) {
            throw new Error(`There are two or more apis named [${api.name}] in the api gateway`);
        } else if (apiGatewayList.length === 1) {
            const apiId = apiGatewayList[0].ApiId;
            const apiGatewayInfo = await getApiGatwayInfo(apiId);
            console.log(`    - ApiName : ${apiGatewayInfo.ApiName}`);
            console.log(`    - ServiceProtocol : ${apiGatewayInfo.ServiceConfig.ServiceProtocol}`);
            console.log(`    - ServiceTimeout : ${apiGatewayInfo.ServiceConfig.ServiceTimeout}`);
            console.log(`    - ServiceAddress : ${apiGatewayInfo.ServiceConfig.ServiceAddress}`);
            console.log(`    - ServiceHttpMethod : ${apiGatewayInfo.ServiceConfig.ServiceHttpMethod}`);
            console.log(`    - Visibility : ${apiGatewayInfo.Visibility}`);
            console.log(`    - ApiId : ${apiGatewayInfo.ApiId}`);
        } else {
            console.log('No ApiGateway Found');
        }
    }

    if (trigger && trigger.triggerType === 'http') {
        console.log(chalk`\n{bold.cyan - Trigger:}`);
        console.log(`    - Methods: ${trigger.triggerConfig.methods}`);
        console.log(chalk`    - Url: ${chalk.green.bold(
            `https://${account.id}.${region}.fc.aliyuncs.com/2016-08-15/proxy/${serviceName}.${trigger.qualifier}/${functionName}/`)}`);

    } else if (trigger && trigger.triggerType === 'timer') {
        console.log(chalk`\n{bold.cyan - Trigger:}`);
        const tiggerInfo = await fcClient.listTriggers(serviceName, functionName);
        tiggerInfo.data.triggers.forEach((item: any) => {
            console.log(`    - triggerName: ${item.triggerName}`);
            console.log(`    - qualifier: ${item.qualifier}`);
            console.log(`    - triggerType: ${item.triggerType}`);
            console.log(`    - cron: ${item.triggerConfig.cronExpression}`);
            console.log(`    - enable: ${item.triggerConfig.enable}`);
        });
    } else {
        console.log(chalk`\n{bold.cyan - Trigger:}`);
        const tiggerInfo = await fcClient.listTriggers(serviceName, functionName);
        tiggerInfo.data.triggers.forEach((item: any) => {
            console.log(`    - triggerName: ${item.triggerName}`);
            console.log(`    - qualifier: ${item.qualifier}`);
            console.log(`    - triggerType: ${item.triggerType}`);
        });
    }

    console.log();
    console.log('Finished');
    console.log();

};

async function createClients(faasConfig: any, region: string, credentials: Credentials, account: Account) {
    fcClient = new FCClient(account.id, {
        accessKeyID: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        securityToken: credentials.token,
        region,
        timeout: faasConfig.timeout,
        secure: faasConfig.secure,
        internal: faasConfig.internal
    });

    apiClient = new CloudAPI({
        accessKeyId: credentials.accessKeyId,
        accessKeySecret: credentials.accessKeySecret,
        endpoint: `http://apigateway.${region}.aliyuncs.com`,
    });
}

async function getApiGatwayList(api: any) {
    const apiName = api.name;
    const result = await apiClient.describeApis({
        ApiName: apiName,
        PageSize: 100
    });
    const apis = result.ApiSummarys ? result.ApiSummarys.ApiSummary.filter((item: any) => item.ApiName === apiName) : [];
    return apis;
}

async function getApiGatwayInfo(apiId: any) {
    const result = await apiClient.describeApi({
        GroupId: '',
        ApiId: apiId,
    });
    return result;
}
