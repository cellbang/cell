export const CredentialsProvider = Symbol('CredentialsProvider');

export interface Credentials {
    accessKeyId: string;
    accessKeySecret: string;
    token?: string;
}

export interface CredentialsProvider {
    provide(): Promise<Credentials | undefined>
}
