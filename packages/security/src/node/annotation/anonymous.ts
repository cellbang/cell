import { Authorize, AuthorizeType } from './authorize';

export const Anonymous = function (): any {
    return Authorize({ el: 'true', type: AuthorizeType.Pre });
};
