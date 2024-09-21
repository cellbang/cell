import { JwtDecoderFactory, JwtDecoder, JwkSetManager, JwsAlgorithms } from '@celljs/oauth2-jose';
import { ClientRegistration, JwsAlgorithmResolver, MISSING_SIGNATURE_VERIFIER_ERROR_CODE } from './registration-protocol';
import { Component, Autowired } from '@celljs/core';
import { ProviderDetailsManager, ProviderDetails } from '../provider';
import { jwtVerify, KeyLike, generateSecret } from 'jose';
import { OAuth2AuthenticationError, AuthorizationRequest } from '@celljs/oauth2-core';
import { AuthorizationRequestManager } from '../authorization';

@Component()
export class IdTokenJwtDecoderFactory implements JwtDecoderFactory<ClientRegistration> {

    @Autowired(JwsAlgorithmResolver)
    protected readonly jwsAlgorithmResolver: JwsAlgorithmResolver;

    @Autowired(AuthorizationRequestManager)
    protected readonly authorizationRequestManager: AuthorizationRequestManager<AuthorizationRequest>;

    @Autowired(JwkSetManager)
    protected readonly jwkSetManager: JwkSetManager<KeyLike | Uint8Array>;

    @Autowired(ProviderDetailsManager)
    protected readonly providerDetailsManager: ProviderDetailsManager;

    protected readonly jwtDecoders = new Map<string, JwtDecoder>();

    async create(clientRegistration: ClientRegistration): Promise<JwtDecoder> {
        const { registrationId } = clientRegistration;
        let jwtDecoder = this.jwtDecoders.get(registrationId);
        if (!jwtDecoder) {
            const jwsAlgorithm = await this.jwsAlgorithmResolver.reolve(clientRegistration);
            const { jwkSetUri, issuerUri } = <ProviderDetails> await this.providerDetailsManager.get(registrationId);

            let key: KeyLike | Uint8Array;
            if (jwsAlgorithm === JwsAlgorithms.RS256) {
                if (!jwkSetUri) {
                    throw new OAuth2AuthenticationError({
                        errorCode: MISSING_SIGNATURE_VERIFIER_ERROR_CODE,
                        description: `Failed to find a Signature Verifier for Client Registration: '${registrationId}'. Check to ensure you have configured the JwkSet URI.`
                    });
                }
                key = await this.jwkSetManager.get(jwkSetUri);
            } else {
                const { clientSecret } = clientRegistration;
                if (!clientSecret) {
                    throw new OAuth2AuthenticationError({
                        errorCode: MISSING_SIGNATURE_VERIFIER_ERROR_CODE,
                        description: `Failed to find a Signature Verifier for Client Registration: '${registrationId}'. Check to ensure you have configured the client secret.`
                    });
                }
                key = await generateSecret(clientRegistration.clientSecret);
            }
            jwtDecoder = {
                decode: async token => {
                    const { payload, protectedHeader } = await jwtVerify(token, key, {
                        issuer: issuerUri,
                        audience: clientRegistration.clientId,
                        algorithms: [ jwsAlgorithm ]
                    });
                    return {
                        header: protectedHeader,
                        payload,
                        token
                    };
                }
            };
            this.jwtDecoders.set(registrationId, jwtDecoder);
        }
        return jwtDecoder;
    }

}
