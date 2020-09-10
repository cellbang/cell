import { ClientRegistrationManager, ClientRegistration } from './registration-protocol';
import { Value, Component } from '@malagu/core';
import { AuthorizationGrantType, ClientAuthenticationMethod } from '@malagu/oauth2-core';

@Component(ClientRegistrationManager)
export class InMemoryClientRegistrationManager implements ClientRegistrationManager {

    @Value('malagu.oauth2.client.registrations')
    protected readonly registrations: { [id: string]: ClientRegistration } = {};

    @Value('malagu.oauth2.client.registrationTemplates')
    protected readonly registrationTemplates: { [id: string]: ClientRegistration } = {};

    @Value('malagu.oauth2.client.defaultRedirectUri')
    protected readonly defaultRedirectUri: string;

    protected initialized = false;

    async get(registrationId: string): Promise<ClientRegistration | undefined> {
        if (!this.initialized) {
            for (const id in this.registrations) {
                if (Object.prototype.hasOwnProperty.call(this.registrations, id)) {
                    const template = this.registrationTemplates[id];
                    const registration = { ...template, ...this.registrations[id] };
                    this.registrations[id] = registration;
                    registration.registrationId = id;
                    registration.clientAuthenticationMethod = registration.clientAuthenticationMethod || this.deduceClientAuthenticationMethod(registration);
                    registration.redirectUri = registration.redirectUri || this.defaultRedirectUri;
                    registration.provider = registration.provider || id;
                    registration.clientName = registration.clientName || id;
                }
            }
            this.initialized = true;
        }

        return this.registrations[registrationId];
    }

    protected deduceClientAuthenticationMethod(clientRegistration: ClientRegistration) {
        if (AuthorizationGrantType.AuthorizationCode === clientRegistration.authorizationGrantType
            && !clientRegistration.clientSecret) {
            return ClientAuthenticationMethod.None;
        }
        return ClientAuthenticationMethod.Basic;
    }

}
