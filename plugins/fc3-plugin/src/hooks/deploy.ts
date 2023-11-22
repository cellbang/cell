import { DeployContext, PathUtil, ProjectUtil, SpinnerUtil } from '@malagu/cli-common';
import { readFile, createWriteStream, remove } from 'fs-extra';
import { join, normalize } from 'path';
import * as JSZip from 'jszip';
import { CloudUtils, DefaultProfileProvider } from '@malagu/cloud-plugin';
import { DefaultCodeLoader } from '@malagu/code-loader-plugin';
import { AutoDomainParams, createFc2Client, createFcClient, getAlias, getCustomDomain, getFunction, getLayer, getTrigger } from './utils';
import { retry } from '@malagu/cli-common/lib/utils';
import { tmpdir } from 'os';
import * as chalk from 'chalk';
import { CodeUri } from '@malagu/code-loader-plugin/lib/code-protocol';
import { generateUUUID } from '@malagu/cli-common/lib/utils/uuid';
import FC20230330, * as $fc from '@alicloud/fc20230330';
import AutoDomainGenerator from '@serverless-cd/srm-aliyun-fc-domain';
import OSS = require('ali-oss');

let fcClient: FC20230330;
let fc2Client: any;
let projectId: string;
let accountId: string;

export default async (context: DeployContext) => {
    const { cfg, pkg } = context;
    const cloudConfig = CloudUtils.getConfiguration(cfg);
    const { layer, trigger, customDomain, alias, disableProjectId } = cloudConfig;
    const functionMeta = cloudConfig.function;

    const profileProvider = new DefaultProfileProvider();
    const { region, account, credentials } = await profileProvider.provide(cloudConfig);
    fcClient = await createFcClient(cloudConfig, region, credentials, account);
    fc2Client = await createFc2Client(cloudConfig, region, credentials, account);
    accountId = account.id;

    console.log(`\nDeploying ${chalk.bold.yellow(pkg.pkg.name)} to the ${chalk.bold.blue(region)} region of ${cloudConfig.name}...`);
    console.log(chalk`{bold.cyan - Profile: }`);
    console.log(`    - AccountId: ${account?.id}`);
    console.log(`    - Region: ${region}`);

    console.log(chalk`{bold.cyan - FC:}`);

    await publishLayerIfNeed(layer);

    delete functionMeta.callbackWaitsForEmptyEventLoop;
    const functionName = await createOrUpdateFunction(functionMeta, disableProjectId);

    const { body: { versionId } } = await fcClient.publishFunctionVersion(functionName, new $fc.PublishFunctionVersionRequest({}));

    await createOrUpdateAlias(alias, functionName, versionId!);

    if (trigger?.triggerType === 'timer') {
        await createOrUpdateTimerTrigger(trigger, functionMeta.name);
    } else if (trigger?.triggerType === 'http') {
        await createOrUpdateHttpTrigger(trigger, functionMeta.name, region);
    } else if (trigger) {
        await createOrUpdateTrigger(trigger, functionMeta.name);
    }

    if (customDomain?.name) {
        for (const route of customDomain.routeConfig.routes) {
            route.functionName = route.functionName || functionMeta.name;
            route.qualifier = route.qualifier || alias.name;
        }
        await createOrUpdateCustomDomain(customDomain, alias.name, {
            type: 'fc',
            user: account.id,
            region: region.replace(/_/g, '-').toLocaleLowerCase(),
            function: functionMeta.name.replace(/_/g, '-').toLocaleLowerCase()
        }, credentials);

    }

    console.log('Deploy finished');
    console.log();

};

async function createOrUpdateHttpTrigger(trigger: any, functionName: string, region: string) {
    const { triggerConfig } = trigger;

    const triggerInfo = await createOrUpdateTrigger(trigger, functionName);
    const urlInternet: string = triggerInfo?.httpTrigger?.urlInternet || '';
    const urlIntranet: string = triggerInfo?.httpTrigger?.urlIntranet || '';

    console.log(`    - Methods: ${triggerConfig.methods}`);
    console.log(chalk`    - Url[Internet]: ${chalk.green.bold(urlInternet)}`);
    console.log(chalk`    - Url[Intranet]: ${chalk.green.bold(urlIntranet)}`);
}

async function createOrUpdateTimerTrigger(trigger: any, functionName: string) {
    const { triggerConfig } = trigger;

    await createOrUpdateTrigger(trigger, functionName);

    console.log(`    - Cron: ${triggerConfig.cronExpression}`);
    console.log(`    - Enable: ${triggerConfig.enable}`);
}

async function createOrUpdateTrigger(trigger: any, functionName: string) {
    const opts = { ...trigger };
    opts.triggerName = opts.name;
    delete opts.functionName;
    delete opts.name;

    const triggerName = trigger.name;

    let triggerInfo = await getTrigger(fcClient, functionName, triggerName);
    if (triggerInfo) {
        await SpinnerUtil.start(`Update ${triggerName} trigger`, async () => {
            try {
                await fcClient.updateTrigger(functionName, triggerName, new $fc.UpdateTriggerRequest({
                    body: new $fc.UpdateTriggerInput({
                        ...opts,
                        triggerConfig: JSON.stringify(opts.triggerConfig || {})
                    })
                }));
            } catch (error) {
                if (error.message?.includes('Updating trigger is not supported yet')) {
                    await fcClient.deleteTrigger(functionName, triggerName);
                    await fcClient.createTrigger(functionName, new $fc.CreateTriggerRequest({
                        body: new $fc.CreateTriggerInput({
                            ...opts,
                            triggerConfig: JSON.stringify(opts.triggerConfig || {})
                        })
                    }));
                    return;
                }
                throw error;
            }
        });
    } else {
        await SpinnerUtil.start(`Create ${triggerName} trigger`, async () => {
            const result = await fcClient.createTrigger(functionName, new $fc.CreateTriggerRequest({
                body: new $fc.CreateTriggerInput({
                    ...opts,
                    triggerConfig: JSON.stringify(opts.triggerConfig || {})
                })
            }));

            triggerInfo = result.body;
        });
    }

    return triggerInfo;
}

async function tryCreateProjectId(functionName: string) {
    projectId = await ProjectUtil.createProjectId();
    const functionInfo = await getFunction(fcClient, `${functionName}_${projectId}`);
    if (functionInfo) {
        await tryCreateProjectId(functionName);
    }
}

async function parseCode(codeUri: CodeUri | string, withoutCodeLimit: boolean) {
    const s3Uri = CloudUtils.parseS3Uri(codeUri);
    let code: JSZip | undefined;
    if (!s3Uri) {
        const codeLoader = new DefaultCodeLoader();
        code = await codeLoader.load(PathUtil.getProjectDistPath(), codeUri);
    }

    if (s3Uri) {
        return {
            ossBucketName: s3Uri.bucket,
            ossObjectName: s3Uri.key
        };
    } else {
        if (withoutCodeLimit === true) {
            const _tmpdir = tmpdir();
            const zipFile = join(_tmpdir, generateUUUID());
            return new Promise((resolve, reject) =>
                code!.generateNodeStream({ type: 'nodebuffer', platform: 'UNIX', compression: 'DEFLATE', streamFiles: true })
                    .pipe(createWriteStream(zipFile))
                    .on('finish', () => {
                        resolve({
                            zipFile
                        });
                    })
                    .on('error', error => {
                        reject(error);
                    })
            );
        }
        return { zipFile: await code!.generateAsync({ type: 'base64', platform: 'UNIX', compression: 'DEFLATE' }) };
    }
}

async function publishLayerIfNeed(layer: any = {}) {
    if (!layer.name || !layer.codeUri) {
        return;
    }
    const layerInfo = await getLayer(fcClient, layer.name);
    if (!layerInfo || layer.sync) {
        const opts = { ...layer };
        delete opts.codeUri;
        delete opts.name;
        delete layer.sync;

        await SpinnerUtil.start(`Publish ${layer.name} layer`, async () => {
            let code: any = await parseCode(layer.codeUri, layer.withoutCodeLimit);
            if (layer.withoutCodeLimit && code.zipFile) {
                code = await uploadCodeToTempBucket(code.zipFile);
            }
            await fcClient.createLayerVersion(layer.name, new $fc.CreateLayerVersionRequest({
                body: new $fc.CreateLayerVersionInput({
                    ...opts,
                    code: new $fc.InputCodeLocation(code)
                })
            }));
        });
    } else {
        await SpinnerUtil.start(`Skip ${layer.name} layer`, async () => { });
    }
}

async function createOrUpdateFunction(functionMeta: any, disableProjectId: boolean): Promise<string> {
    const opts = { ...functionMeta };
    const sync = opts.sync;
    opts.environmentVariables = opts.env;
    delete opts.sync;
    delete opts.name;
    delete opts.env;
    delete opts.codeUri;

    if (sync !== 'onlyUpdateCode' && opts.layers) {
        const newLayers = [];
        for (const layer of opts.layers) {
            if (layer) {
                if (layer.includes('#')) {
                    newLayers.push(layer);
                } else {
                    const layerInfo = await getLayer(fcClient, layer);
                    newLayers.push(layerInfo?.layerVersionArn);
                }
            }
        }
        opts.layers = newLayers;
    }

    projectId = await ProjectUtil.getProjectId();
    let functionInfo: any;

    if (disableProjectId) {
        functionInfo = await getFunction(fcClient, functionMeta.name);
    } else {
        if (!projectId) {
            await tryCreateProjectId(functionMeta.name);
            await ProjectUtil.saveProjectId(projectId);
            functionMeta.name = `${functionMeta.name}_${projectId}`;
        } else {
            functionMeta.name = `${functionMeta.name}_${projectId}`;
            functionInfo = await getFunction(fcClient, functionMeta.name);
        }
    }

    let code: any = await parseCode(functionMeta.codeUri, functionMeta.withoutCodeLimit);
    if (functionMeta.withoutCodeLimit && code.zipFile) {
        code = await uploadCodeToTempBucket(code.zipFile);
    }
    if (functionInfo) {
        delete opts.runtime;
        await SpinnerUtil.start(`Update ${functionMeta.name} function${sync === 'onlyUpdateCode' ? ' (only update code)' : ''}`, async () => {
            await fcClient.updateFunction(functionMeta.name, new $fc.UpdateFunctionRequest({
                body: new $fc.UpdateFunctionInput({
                    ...(sync === 'onlyUpdateCode' ? {} : opts),
                    code: new $fc.InputCodeLocation(code)
                })
            }));
        });
    } else {
        opts.functionName = functionMeta.name;
        await SpinnerUtil.start(`Create ${functionMeta.name} function`, async () => {
            await fcClient.createFunction(new $fc.CreateFunctionRequest({
                body: new $fc.CreateFunctionInput({
                    ...opts,
                    code: new $fc.InputCodeLocation(code)
                })
            }));
        });
    }
    if (functionMeta.withoutCodeLimit && code.zipFile) {
        remove(code.zipFile).catch(() => {});
    }

    return functionMeta.name;
}

async function createOrUpdateCustomDomain(customDomain: any, qualifier: string, params: AutoDomainParams, credentials: any) {
    const { name, protocol, certConfig, routeConfig } = customDomain;
    let domainName = name;
    const opts: any = {
        protocol
    };

    if (domainName === 'auto') {
        await SpinnerUtil.start('Generated custom domain', async () => {
            domainName = await AutoDomainGenerator.genDomain({ ...params, service: 'fcv3'}, {
                AccountID: accountId,
                AccessKeyID: credentials.accessKeyId,
                AccessKeySecret: credentials.accessKeySecret,
            });
        });
    }

    if (certConfig?.certName) {
        opts.certConfig = { ...certConfig };
        const privateKey = certConfig.privateKey;
        const certificate = certConfig.certificate;

        if (privateKey?.endsWith('.key')) {
            opts.certConfig.privateKey = await readFile(privateKey, 'utf-8');
        }
        if (certificate?.endsWith('.pem')) {
            opts.certConfig.certificate = await readFile(certificate, 'utf-8');
        }
    }

    if (routeConfig) {
        opts.routeConfig = routeConfig;
    }
    const customDomainInfo = await getCustomDomain(fcClient, domainName);
    if (customDomainInfo) {
        const { data } = customDomainInfo;
        const routes: any[] = [];
        if (data?.routeConfig?.routes) {
            for (const route of data.routeConfig.routes) {
                const target = opts.routeConfig.routes.find((r: any) => r.path === route.path);
                if (target) {
                    routes.push({ ...route, ...target });
                    opts.routeConfig.routes.splice(opts.routeConfig.routes.findIndex((r: any) => r.path === target.path), 1);
                } else {
                    routes.push(route);
                }
            }
            opts.routeConfig.routes = [...opts.routeConfig.routes, ...routes];
        }
        await SpinnerUtil.start(`Update ${domainName} custom domain`, async () => {
            await fcClient.updateCustomDomain(domainName, new $fc.UpdateCustomDomainRequest({
                body: new $fc.UpdateCustomDomainInput(opts)
            }));
        });
    } else {
        opts.domainName = domainName;
        await SpinnerUtil.start(`Create ${domainName} custom domain`, async () => {
            retry(async () => {
                await fcClient.createCustomDomain(new $fc.CreateCustomDomainRequest({
                    body: new $fc.CreateCustomDomainInput(opts)
                }));
            }, 1000, 5);
        });
    }
    let path = '';
    if (opts.routeConfig?.routes?.length) {
        for (const route of opts.routeConfig.routes) {
            if (route.qualifier === qualifier) {
                path = route.path?.split('*')[0] || '';
            }
        }
    }
    console.log(chalk`    - Url: ${chalk.green.bold(
        `${protocol.includes('HTTPS') ? 'https' : 'http'}://${domainName}${path}`)}`);
}

async function createOrUpdateAlias(alias: any, functionName: string, versionId: string) {
    const aliasInfo = await getAlias(fcClient, alias.name, functionName);
    if (aliasInfo) {
        await SpinnerUtil.start(`Update ${alias.name} alias to version ${versionId}`, async () => {
            await fcClient.updateAlias(functionName, alias.name, new $fc.UpdateAliasRequest({
                body: new $fc.UpdateAliasInput({ versionId })
            }));
        });
    } else {
        await SpinnerUtil.start(`Create ${alias.name} alias to version ${versionId}`, async () => {
            await fcClient.createAlias(functionName, new $fc.CreateAliasRequest({
                body: new $fc.CreateAliasInput({
                    aliasName: alias.name,
                    versionId: versionId,
                })
            }));
        });
    }
}

async function uploadCodeToTempBucket(zipFilePath: string) {
    const data = (await fc2Client.getTempBucketToken()).data;
    const client = new OSS({
        region: data.ossRegion,
        accessKeyId: data.credentials.AccessKeyId,
        accessKeySecret: data.credentials.AccessKeySecret,
        stsToken: data.credentials.SecurityToken,
        bucket: data.ossBucket,
        timeout: '600000', // 10min
      });
      const ossObjectName = `${accountId}/${data.objectName}`;
      await client.put(ossObjectName, normalize(zipFilePath));

      return {
        ossBucketName: data.ossBucket,
        ossObjectName: ossObjectName
      };
}
