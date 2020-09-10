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
     * {@code iss} - the Issuer identifier
     */
    export const ISS = 'iss';

    /**
     * {@code sub} - the Subject identifier
     */
    export const SUB = 'sub';

    /**
     * {@code aud} - the Audience(s) that the ID Token is intended for
     */
    export const AUD = 'aud';

    /**
     * {@code exp} - the Expiration time on or after which the ID Token MUST NOT be accepted
     */
    export const EXP = 'exp';

    /**
     * {@code iat} - the time at which the ID Token was issued
     */
    export const IAT = 'iat';

    /**
     * {@code auth_time} - the time when the End-User authentication occurred
     */
    export const AUTH_TIME = 'auth_time';

    /**
     * {@code nonce} - a {@code export const} value used to associate a Client session with an ID Token,
     * and to mitigate replay attacks.
     */
    export const NONCE = 'nonce';

    /**
     * {@code acr} - the Authentication Context Class Reference
     */
    export const ACR = 'acr';

    /**
     * {@code amr} - the Authentication Methods References
     */
    export const AMR = 'amr';

    /**
     * {@code azp} - the Authorized party to which the ID Token was issued
     */
    export const AZP = 'azp';

    /**
     * {@code at_hash} - the Access Token hash value
     */
    export const AT_HASH = 'at_hash';

    /**
     * {@code c_hash} - the Authorization Code hash value
     */
    export const C_HASH = 'c_hash';

}
