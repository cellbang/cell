import { Jwt } from '@malagu/oauth2-jose';
import { OAuth2UserRequest } from '../endpoint';

export interface Oidc2UserRequest extends OAuth2UserRequest {
    idToken: Jwt;
}
