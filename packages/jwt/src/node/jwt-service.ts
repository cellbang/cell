import { Autowired, Component, Value } from '@celljs/core';
import { DecodeOptions, JwtOptions, JwtPayload, JwtSecretService, JwtService, Secret, SignOptions, VerifyOptions } from './jwt-protocol';
import * as jwt from 'jsonwebtoken';

@Component(JwtService)
export class JwtServiceImpl implements JwtService {

    @Value('cell.jwt')
    protected readonly jwtOptions?: JwtOptions;

    @Autowired(JwtSecretService)
    protected readonly jwtSecretService: JwtSecretService;

    async sign(payload: string | object | Buffer, options?: SignOptions, privateKey?: Secret): Promise<string> {
        const mergedOptions = { ...this.jwtOptions?.signOptions, ...options };
        const secret = privateKey ?? await this.jwtSecretService.getPrivateKey();
        return new Promise<string>((resolve, reject) => {
            jwt.sign(payload, secret, mergedOptions, (err, token) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token || '');
                }
            });
        });
    }

    async verify<T extends object = any>(token: string, options?: VerifyOptions, publicKey?: string | Buffer): Promise<T> {
        const mergedOptions = { ...this.jwtOptions?.verifyOptions, ...options };
        const secret = publicKey ?? await this.jwtSecretService.getPublicKey();
        return new Promise<T>((resolve, reject) => {
            jwt.verify(token, secret, mergedOptions, (err, decoded) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded as T);
                }
            });
        });
    }

    async decode(token: string, options?: DecodeOptions): Promise<JwtPayload | string | undefined> {
        const decoded = jwt.decode(token, options);
        if (!decoded) {
            return undefined;
        }
        return decoded;
    }

}
