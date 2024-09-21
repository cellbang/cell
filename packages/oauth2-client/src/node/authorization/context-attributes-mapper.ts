import { ContextAttributesMapper, AuthorizeRequest, AuthorizationContext } from './authorization-protocol';
import { Component } from '@celljs/core';
import { Context, AttributeScope } from '@celljs/web/lib/node';
import { OAuth2ParameterNames } from '@celljs/oauth2-core';

@Component(ContextAttributesMapper)
export class DefaultContextAttributesMapper implements ContextAttributesMapper {

    async apply(authorizeRequest: AuthorizeRequest): Promise<Map<string, any>> {
        const contextAttributes = new Map<string, any>();
        const scopes = Context.getAttr<string>(OAuth2ParameterNames.SCOPE, AttributeScope.Request);
        if (scopes) {
            contextAttributes.set(AuthorizationContext.REQUEST_SCOPE_ATTRIBUTE_NAME, scopes.split(' '));
        }
        return contextAttributes;
    }

}
