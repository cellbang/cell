import { ClientAuthenticationMethod } from '@celljs/oauth2-core';
import { ClientRegistration } from '../registration';
import { MediaType, HttpHeaders } from '@celljs/http';
import { enc } from 'crypto-js';

export namespace AuthorizationGrantRequestEntityUtil {

    export function getTokenRequestHeaders(clientRegistration: ClientRegistration): { [key: string]: any } {
        const headers = { ...getDefaultTokenRequestHeaders() };
        const { clientAuthenticationMethod, clientId, clientSecret } = clientRegistration;
        if (clientAuthenticationMethod === ClientAuthenticationMethod.Basic) {
            const credentialsStr = `${clientId}:${clientSecret}`;
            const encoded = enc.Latin1.parse(credentialsStr);
            headers[HttpHeaders.AUTHORIZATION] = `${clientAuthenticationMethod} ${enc.Base64.stringify(encoded)}`;
        }
        return headers;
    }

    export function getDefaultTokenRequestHeaders(): { [key: string]: any } {

        return {
            [HttpHeaders.ACCEPT]: MediaType.APPLICATION_JSON_UTF8,
            [HttpHeaders.CONTENT_TYPE]: `${MediaType.APPLICATION_FORM_URLENCODED};charset=UTF-8`
        };
    }
}
