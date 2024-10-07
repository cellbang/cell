export interface Token {
    tokenValue: string;
    issuedAt: number;
}

export enum TokenType {
    Bearer = 'Bearer'
}

export interface AccessToken extends Token {
    tokenType?: TokenType;
    scopes: string[];
    expiresAt: number;
}

export interface RefreshToken extends Token {}

export namespace IdTokenClaimNames {

    /**
     * `iss`- the Issuer identifier
     */
    export const ISS = 'iss';

    /**
     * `sub`- the Subject identifier
     */
    export const SUB = 'sub';

    /**
     * `aud`- the Audience(s) that the ID Token is intended for
     */
    export const AUD = 'aud';

    /**
     * `exp`- the Expiration time on or after which the ID Token MUST NOT be accepted
     */
    export const EXP = 'exp';

    /**
     * `iat`- the time at which the ID Token was issued
     */
    export const IAT = 'iat';

    /**
     * `auth_time`- the time when the End-User authentication occurred
     */
    export const AUTH_TIME = 'auth_time';

    /**
     * `nonce`- a `export const`value used to associate a Client session with an ID Token,
     * and to mitigate replay attacks.
     */
    export const NONCE = 'nonce';

    /**
     * `acr`- the Authentication Context Class Reference
     */
    export const ACR = 'acr';

    /**
     * `amr`- the Authentication Methods References
     */
    export const AMR = 'amr';

    /**
     * `azp`- the Authorized party to which the ID Token was issued
     */
    export const AZP = 'azp';

    /**
     * `at_hash`- the Access Token hash value
     */
    export const AT_HASH = 'at_hash';

    /**
     * `c_hash`- the Authorization Code hash value
     */
    export const C_HASH = 'c_hash';

}
