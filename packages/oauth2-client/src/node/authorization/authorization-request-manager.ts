import { AuthorizationRequestManager } from './authorization-protocol';
import { AuthorizationRequest, OAuth2ParameterNames } from '@celljs/oauth2-core';
import { Context } from '@celljs/web/lib/node';
import { ok } from 'assert';
import { Component } from '@celljs/core';

@Component(AuthorizationRequestManager)
export class HttpSessionAuthorizationRequestManager implements AuthorizationRequestManager<AuthorizationRequest> {

    protected readonly sessionAttributeName = `${HttpSessionAuthorizationRequestManager.name}.AUTHORIZATION_REQUEST`;

    async get(): Promise<AuthorizationRequest | undefined> {
        const stateParameter = this.getStateParameter();
        if (stateParameter) {
            return this.getAuthorizationRequests()[stateParameter];
        }
    }

    async save(authorizationRequest: AuthorizationRequest): Promise<void> {
        if (authorizationRequest) {
            const state = authorizationRequest.state;
            ok(state, 'authorizationRequest.state cannot be empty');
            const authorizationRequests = this.getAuthorizationRequests();
            authorizationRequests[state] = authorizationRequest;
            const session = Context.getSession();
            session[this.sessionAttributeName] = authorizationRequests;
        } else {
            await this.remove();
        }
    }
    async remove(): Promise<AuthorizationRequest | undefined> {
        const stateParameter = this.getStateParameter();
        if (stateParameter) {
            const authorizationRequests = this.getAuthorizationRequests();
            const originalRequest = authorizationRequests[stateParameter];
            delete authorizationRequests[stateParameter];
            if (!Object.keys(authorizationRequests).length) {
                const session = Context.getSession();
                delete session[this.sessionAttributeName];
            }
            return originalRequest;
        }
    }

    protected getStateParameter(): string | undefined {
        return <string>Context.getRequest().query[OAuth2ParameterNames.STATE];
    }

    protected getAuthorizationRequests(): { [state: string]: AuthorizationRequest } {
        const session = Context.getSession();
        return session[this.sessionAttributeName] || {};
    }

}
