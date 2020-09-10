import { TokenType } from '../token';
import { AccessTokenResponse, OAuth2ParameterNames } from './endpoint-protocol';
import { Component } from '@malagu/core';

@Component(AccessTokenResponseConverter)
export class AccessTokenResponseConverter {
    convert(tokenResponse: { [key: string]: string }): AccessTokenResponse {
        const accessToken = tokenResponse[OAuth2ParameterNames.ACCESS_TOKEN];
        const tokenType = this.getAccessTokenType(tokenResponse);
        const expiresIn = this.getExpiresIn(tokenResponse);
        const scopes = this.getScopes(tokenResponse);
        const refreshToken = tokenResponse[OAuth2ParameterNames.REFRESH_TOKEN];

        const additionalParameters: { [key: string]: string } = {};
        for (const key in tokenResponse) {
            if (Object.prototype.hasOwnProperty.call(tokenResponse, key)) {
                if ([OAuth2ParameterNames.ACCESS_TOKEN, OAuth2ParameterNames.EXPIRES_IN,
                    OAuth2ParameterNames.REFRESH_TOKEN, OAuth2ParameterNames.SCOPE, OAuth2ParameterNames.TOKEN_TYPE].indexOf(key) !== -1) {
                    additionalParameters[key] = tokenResponse[key];
                }
            }
        }

        const issuedAt = Date.now();
        const expiresAt = expiresIn > 0 ? issuedAt + 1000 * expiresIn : issuedAt + 1000;

        return {
            accessToken: {
                tokenType,
                issuedAt,
                expiresAt,
                tokenValue: accessToken,
                scopes
            },
            refreshToken: refreshToken ? { tokenValue: refreshToken, issuedAt } : undefined,
            additionalParameters
        };

    }

    protected getScopes(tokenResponse: { [key: string]: string; }) {
        if (tokenResponse[OAuth2ParameterNames.SCOPE]) {
            return tokenResponse[OAuth2ParameterNames.SCOPE].split(' ');
        }
        return [];
    }

    protected getExpiresIn(tokenResponse: { [key: string]: string; }) {
        if (tokenResponse[OAuth2ParameterNames.EXPIRES_IN]) {
            return parseInt(tokenResponse[OAuth2ParameterNames.EXPIRES_IN]);
        }
        return 0;
    }

    protected getAccessTokenType(tokenResponse: { [key: string]: string; }) {
        if (TokenType.Bearer.toUpperCase() === (tokenResponse[OAuth2ParameterNames.TOKEN_TYPE] || '').toUpperCase()) {
            return TokenType.Bearer;
        }
    }
}
