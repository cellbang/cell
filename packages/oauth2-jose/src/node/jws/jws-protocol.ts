export namespace JwsAlgorithms {
    /**
     * HMAC using SHA-256 (Required)
     */
    export const HS256 = 'HS256';

    /**
     * HMAC using SHA-384 (Optional)
     */
    export const HS384 = 'HS384';

    /**
     * HMAC using SHA-512 (Optional)
     */
    export const HS512 = 'HS512';

    /**
     * RSASSA-PKCS1-v1_5 using SHA-256 (Recommended)
     */
    export const RS256 = 'RS256';

    /**
     * RSASSA-PKCS1-v1_5 using SHA-384 (Optional)
     */
    export const RS384 = 'RS384';

    /**
     * RSASSA-PKCS1-v1_5 using SHA-512 (Optional)
     */
    export const RS512 = 'RS512';

    /**
     * ECDSA using P-256 and SHA-256 (Recommended+)
     */
    export const ES256 = 'ES256';

    /**
     * ECDSA using P-384 and SHA-384 (Optional)
     */
    export const ES384 = 'ES384';

    /**
     * ECDSA using P-521 and SHA-512 (Optional)
     */
    export const ES512 = 'ES512';

    /**
     * RSASSA-PSS using SHA-256 and MGF1 with SHA-256 (Optional)
     */
    export const PS256 = 'PS256';

    /**
     * RSASSA-PSS using SHA-384 and MGF1 with SHA-384 (Optional)
     */
    export const PS384 = 'PS384';

    /**
     * RSASSA-PSS using SHA-512 and MGF1 with SHA-512 (Optional)
     */
    export const PS512 = 'PS512';

}
