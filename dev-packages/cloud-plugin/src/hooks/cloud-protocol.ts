
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
}

export interface ProfileProvider {
    provide(cloudConfiguration: CloudConfiguration, quiet?: boolean): Promise<Profile>;
}

export interface CloudConfiguration {
    profilePath: string;
    regions: string[];
    region: string;
    account: Account;
    credentials: Credentials;
    [key: string]: any;
}

