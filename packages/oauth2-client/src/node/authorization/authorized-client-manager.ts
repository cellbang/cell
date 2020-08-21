import { AuthorizedClient, AuthorizedClientManager } from './authorization-protocol';
import { Component, Autowired } from '@malagu/core';
import { ClientRegistrationManager } from '../registration';

@Component(AuthorizedClientManager)
export class InMemoryAuthorizedClientManager implements AuthorizedClientManager<AuthorizedClient> {

    protected readonly authorizedClients = new Map<string, AuthorizedClient>();

    @Autowired(ClientRegistrationManager)
    protected readonly clientRegistrationManager: ClientRegistrationManager;

    async get(clientRegistrationId: string, principalName: string): Promise<AuthorizedClient | undefined> {
        const registration = await this.clientRegistrationManager.get(clientRegistrationId);
        if (registration) {
            return this.authorizedClients.get(this.getId(clientRegistrationId, principalName));
        }
    }
    async save(authorizedClient: AuthorizedClient, principalName: string): Promise<void> {
        const { clientRegistration } = authorizedClient;
        this.authorizedClients.set(this.getId(clientRegistration.registrationId, principalName), authorizedClient);
    }

    async remove(clientRegistrationId: string, principalName: string): Promise<void> {
        const registration = await this.clientRegistrationManager.get(clientRegistrationId);
        if (registration) {
            this.authorizedClients.delete(this.getId(clientRegistrationId, principalName));
        }
    }

    protected getId(clientRegistrationId: string, principalName: string) {
        return `${clientRegistrationId}@${principalName}`;
    }

}
