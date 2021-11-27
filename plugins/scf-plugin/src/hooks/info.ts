import { CliContext } from '@malagu/cli-service';
import { scf } from 'tencentcloud-sdk-nodejs';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
const chalk = require('chalk');

const ScfClient = scf.v20180416.Client;

let clientConfig: any;

export default async (context: CliContext) => {
    const { cfg, pkg } = context;

    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const faasConfig = cloudConfig.faas;

    const profileProvider = new DefaultProfileProvider();
    const { region, credentials } = await profileProvider.provide(cloudConfig);
    clientConfig = {
        credential: {
            secretId: credentials.accessKeyId,
            secretKey: credentials.accessKeySecret,
        },
        profile: {
            signMethod: 'HmacSHA256',
            httpProfile: {
                reqMethod: 'POST',
                reqTimeout: 30,
            },
        },
        region: region,
    };
    const { namespace, apiGateway } = faasConfig;
    const functionMeta = faasConfig.function;
    const functionName = functionMeta.name;

    console.log(`\nGetting ${chalk.bold.yellow(pkg.pkg.name)} from the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);

    console.log(chalk`{bold.cyan - SCF:}`);

    try {
        const functionInfo = await getFunction(namespace.name, functionName);

        console.log(`    - FunctionName : ${functionInfo.FunctionName}`);
        console.log(`    - FunctionVersion : ${functionInfo.FunctionVersion}`);
        console.log(`    - Status : ${functionInfo.Status}`);
        console.log(`    - Qualifier : ${functionInfo.Qualifier}`);
        console.log(`    - Timeout : ${functionInfo.Timeout}`);
        console.log(`    - LastModifiedTime : ${functionInfo.ModTime}`);

    } catch (error) {
        if (error.code === 'ResourceNotFound.Function') {
            console.log('No Fuction Found');
        } else {
            throw error;
        }
    }

    if (apiGateway) {
        console.log(chalk`\n{bold.cyan - API Gateway:}`);
        const apiGatewayInfo = await getApiGatway(namespace.name, functionName);
        const tiggerList = apiGatewayInfo.Triggers;
        if (tiggerList) {
            tiggerList.forEach(item => {
                const triggerDesc = JSON.parse(item.TriggerDesc);
                console.log(`    - serviceName : ${triggerDesc.service.serviceName}`);
                console.log(`    - Type : ${item.Type}`);
                console.log(`    - AvailableStatus : ${item.AvailableStatus}`);
                if ( item.Type === 'apigw') {
                     console.log(`    - subDomain : ${triggerDesc.service.subDomain}`);
                }

            });
        } else {
            console.log('No API Gateway Tigger Found');
        }
    }

    console.log();
    console.log('Finished');
    console.log();
};

function getScfClient() {
    return new ScfClient(clientConfig);
}

function getFunction(namespace: string, functionName: string) {
    const scfClient = getScfClient();
    const getFunctionRequest: any = {};
    getFunctionRequest.FunctionName = functionName;
    getFunctionRequest.Namespace = namespace;
    return scfClient.GetFunction(getFunctionRequest);
}

function getApiGatway(namespace: string, functionName: string) {
    const scfClient = getScfClient();
    const getApiGatwayRequest: any = {};
    getApiGatwayRequest.FunctionName = functionName;
    getApiGatwayRequest.Namespace = namespace;
    return scfClient.ListTriggers(getApiGatwayRequest);
}
