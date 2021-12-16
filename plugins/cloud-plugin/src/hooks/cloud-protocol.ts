
export interface Account {
    id: string;
}

export interface Credentials {
    accessKeyId: string;
    accessKeySecret: string;
    token?: string;
}

export interface Profile {
    account: Account
    credentials: Credentials;
    region: string;
    stage?: string;

}

export interface ProfileProvider {
    provide(cloudConfiguration: CloudConfiguration, quiet?: boolean): Promise<Profile>;
}

export interface CloudConfiguration {
    name: string;
    profilePath: string;
    regions: string[];
    region: string;
    account: Account;
    credentials: Credentials;
    [key: string]: any;
}

export interface ConfigOptions {
    accountId?: string;
    accessKeyId?: string;
    accessKeySecret?: string;
    region?: string;
    token?: string;
    show?: boolean;
    logout?: boolean;
    showProfile?: boolean;
    stage?: string;
}
