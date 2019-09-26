import { Authorize, AuthorizeType } from './authorize';

export const PreAuthorize = function (el: string) {
    return Authorize({ el, type: AuthorizeType.Pre });
};
