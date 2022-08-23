import * as jwt from 'jsonwebtoken';

export const JwtService = Symbol('JwtService');
export const JwtSecretService = Symbol('JwtSecretService');

export interface JwtOptions {
    signOptions?: jwt.SignOptions;
    secret?: string | Buffer;
    publicKey?: string | Buffer;
    privateKey?: jwt.Secret;
    verifyOptions?: jwt.VerifyOptions;
}

export interface SignOptions extends jwt.SignOptions {}

export interface VerifyOptions extends jwt.VerifyOptions {}

export interface DecodeOptions extends jwt.DecodeOptions {}

export interface Jwt extends jwt.Jwt {}

export interface JwtPayload extends jwt.JwtPayload {}

export type Secret = jwt.Secret;

export interface JwtService {
    sign(payload: string | Buffer | object, options?: SignOptions, privateKey?: Secret): Promise<string>;
    verify<T extends object = any>(token: string, options?: VerifyOptions, publicKey?: string | Buffer): Promise<T>;
    decode(token: string, options?: DecodeOptions): Promise<JwtPayload | string | undefined>;
}

export interface JwtSecretService {
    getPublicKey(): Promise<string | Buffer>;
    getPrivateKey(): Promise<Secret>;
}
