import { JwtDecoderFactory, JwtDecoder, JwkSetManager, JwsAlgorithms } from '@malagu/oauth2-jose';
import { ClientRegistration, JwsAlgorithmResolver, MISSING_SIGNATURE_VERIFIER_ERROR_CODE } from './registration-protocol';
import { Component, Autowired } from '@malagu/core';
import { ProviderDetailsManager, ProviderDetails } from '../provider';
import { JWT, JWKS, JWK } from 'jose';
import { OAuth2AuthenticationError, AuthorizationRequest, OidcParameterNames } from '@malagu/oauth2-core';
import { AuthorizationRequestManager } from '../authorization';

@Component()
export class IdTokenJwtDecoderFactory implements JwtDecoderFactory<ClientRegistration> {

    @Autowired(JwsAlgorithmResolver)
    protected readonly jwsAlgorithmResolver: JwsAlgorithmResolver;

    @Autowired(AuthorizationRequestManager)
    protected readonly authorizationRequestManager: AuthorizationRequestManager<AuthorizationRequest>;

    @Autowired(JwkSetManager)
    protected readonly jwkSetManager: JwkSetManager<JWKS.KeyStore>;

    @Autowired(ProviderDetailsManager)
    protected readonly providerDetailsManager: ProviderDetailsManager;

    protected readonly jwtDecoders = new Map<string, JwtDecoder>();

    async create(clientRegistration: ClientRegistration): Promise<JwtDecoder> {
        const { registrationId } = clientRegistration;
        let jwtDecoder = this.jwtDecoders.get(registrationId);
        if (!jwtDecoder) {
            const jwsAlgorithm = await this.jwsAlgorithmResolver.reolve(clientRegistration);
            const { jwkSetUri, issuerUri } = <ProviderDetails> await this.providerDetailsManager.get(registrationId);

            let keyOrStore: JWK.Key | JWKS.KeyStore;
            if (jwsAlgorithm === JwsAlgorithms.RS256) {
                if (!jwkSetUri) {
                    throw new OAuth2AuthenticationError({
                        errorCode: MISSING_SIGNATURE_VERIFIER_ERROR_CODE,
                        description: `Failed to find a Signature Verifier for Client Registration: '${registrationId}'. Check to ensure you have configured the JwkSet URI.`
                    });
                }
                keyOrStore = await this.jwkSetManager.get(jwkSetUri);
            } else {
                const { clientSecret } = clientRegistration;
                if (!clientSecret) {
                    throw new OAuth2AuthenticationError({
                        errorCode: MISSING_SIGNATURE_VERIFIER_ERROR_CODE,
                        description: `Failed to find a Signature Verifier for Client Registration: '${registrationId}'. Check to ensure you have configured the client secret.`
                    });
                }
                keyOrStore = JWK.asKey(clientRegistration.clientSecret);
            }
            const authorizationRequest = await this.authorizationRequestManager.get();
            jwtDecoder = {
                decode: async token => ({
                            ...JWT.IdToken.verify(token, keyOrStore, {
                            issuer: issuerUri,
                            audience: clientRegistration.clientId,
                            nonce: authorizationRequest!.attributes.get(OidcParameterNames.NONCE),
                            complete: true,
                            algorithms: [ jwsAlgorithm ]
                        }),
                        token
                    })
            };
            this.jwtDecoders.set(registrationId, jwtDecoder);
        }
        return jwtDecoder;
    }

}
