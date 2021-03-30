import { Credentials, Account } from '@malagu/cloud';
import { DeployContext } from '@malagu/cli-service';
import * as JSZip from 'jszip';

export interface CodeLoader {
    load(ctx: DeployContext, faasAdapterConfiguration: FaaSAdapterConfiguration): Promise<JSZip>;
}

export interface Deployer<P, R> {
    deploy(ctx: P): Promise<R>;
}

export interface Profile {
    account: Account
    credentials: Credentials;
    region: string;
}

export interface ProfileProvider {
    provide(faasAdapterConfiguration: FaaSAdapterConfiguration, quiet?: boolean): Promise<Profile>;
}

export interface CodeUri {
    value?: string;
    exclude?: string | RegExp;
    include?: string | RegExp
}

export interface FaaSAdapterConfiguration {
    type: string;
    profilePath: string;
    regions: string[];
    region: string;
    account: Account;
    credentials: Credentials;
    function: {
        name: string;
        codeUri: CodeUri;
        handler: string;
        memorySize: number
        timeout: number
    }
}

