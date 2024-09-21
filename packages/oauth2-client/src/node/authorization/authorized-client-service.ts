import { AuthorizedClientService, AuthorizeRequest, AuthorizedClient, AuthorizedClientProvider, AuthorizationContext, AuthorizedClientManager,
    ContextAttributesMapper, AuthorizationSuccessHandler, AuthorizationFailureHandler } from './authorization-protocol';
import { Component, Autowired } from '@celljs/core';
import { ClientRegistrationManager } from '../registration';
import { ok } from 'assert';
import { OAuth2AuthorizationError } from '@celljs/oauth2-core';

@Component(AuthorizedClientService)
export class DefaultAuthorizedClientService implements AuthorizedClientService {

    @Autowired(AuthorizedClientProvider)
    protected readonly authorizedClientProviders: AuthorizedClientProvider[];

    @Autowired(ClientRegistrationManager)
    protected readonly clientRegistrationManager: ClientRegistrationManager;

    @Autowired(AuthorizedClientManager)
    protected readonly authorizedClientManager: AuthorizedClientManager<AuthorizedClient>;

    @Autowired(ContextAttributesMapper)
    protected readonly contextAttributesMapper: ContextAttributesMapper;

    @Autowired(AuthorizationSuccessHandler)
    protected readonly authorizationSuccessHandler: AuthorizationSuccessHandler;

    @Autowired(AuthorizationFailureHandler)
    protected readonly authorizationFailureHandler: AuthorizationFailureHandler;

    async authorize(authorizeRequest: AuthorizeRequest): Promise<AuthorizedClient | undefined> {
        const { clientRegistrationId, principal, authorizedClient, attributes } = authorizeRequest;
        const contextAttributes = await this.contextAttributesMapper.apply(authorizeRequest);

        if (attributes) {
            for (const [key, value] of attributes.entries()) {
                contextAttributes.set(key, value);
            }
        }
        const context = <AuthorizationContext>{
            principal,
            attributes: contextAttributes
        };
        if (!authorizedClient) {
            const clientRegistration = await this.clientRegistrationManager.get(clientRegistrationId);
            ok(clientRegistration, `Could not find ClientRegistration with id '${clientRegistrationId}'`);
            context.clientRegistration = clientRegistration!;
            context.authorizedClient = await this.authorizedClientManager.get(clientRegistrationId, principal.name);
        }

        let client: AuthorizedClient | undefined;

        try {
            for (const authorizedClientProvider of this.authorizedClientProviders) {
                client = await authorizedClientProvider.provide(context);
                if (client) {
                    break;
                }
            }
        } catch (error) {
            if (error instanceof OAuth2AuthorizationError) {
                await this.authorizationFailureHandler.onAuthorizationFailure(error, principal);
            }
            throw error;
        }

        if (client) {
            await this.authorizationSuccessHandler.onAuthorizationSuccess(client, principal);
            return client;
        }
        return authorizedClient;

    }

}
