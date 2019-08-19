import { Context } from '@malagu/cli/lib/hook/context';
import { ProfileProvider } from './profile-provider';
import { resolve } from 'path';
const FCClient = require('@alicloud/fc2');
const Zip = require('adm-zip');

export default async (context: Context) => {
    const { pkg } = context;
    const profileProvider = new ProfileProvider();
    const profile = await profileProvider.provide();
    const client = new FCClient(profile.accountId, {
        accessKeyID: profile.accessKeyId,
        accessKeySecret: profile.accessKeySecret,
        region: profile.defaultRegion,
        timeout: 60000
    });

    const serviceName = 'malagu';
    const functionName = pkg.pkg.name;

    console.log(`Deploying ${serviceName}/${functionName} to function compute...`);

    try {
        await client.getService(serviceName);
        console.log(`- Skip ${serviceName} service creation`);
    } catch (ex) {
        if (ex.code === 'ServiceNotFound') {
            await client.createService(serviceName);
            console.log(`- Create a ${serviceName} service`);
        } else {
            throw ex;
        }
    }

    const zip = new Zip();
    zip.addLocalFile(resolve(pkg.projectPath, 'dist', 'backend', 'index.js'));

    try {
        await client.getFunction(serviceName, functionName);
        await client.updateFunction(serviceName, functionName, {
            code: {
                zipFile: zip.toBuffer().toString('base64')
            },
        });
        console.log(`- Update ${functionName} function`);
    } catch (ex) {
        if (ex.code === 'FunctionNotFound') {
            await client.createFunction(serviceName, {
                functionName: functionName,
                handler: 'index.handler',
                memorySize: 128,
                runtime: 'nodejs6',
                initializer: 'index.init',
                code: {
                    zipFile: zip.toBuffer().toString('base64')
                },
            });
            console.log(`- Create ${functionName} function`);
        } else {
            throw ex;
        }
    }

    console.log('Deploy finished');

};
