import { Jwt } from '@malagu/oauth2-jose';
import { OAuth2UserRequest } from '../endpoint';

export interface OidcUserRequest extends OAuth2UserRequest {
    idToken: Jwt;
}
