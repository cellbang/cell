import { Authorize, AuthorizeType } from './authorize';

export const Authenticated = function () {
    return Authorize({ el: 'authenticated', type: AuthorizeType.Pre });
};
