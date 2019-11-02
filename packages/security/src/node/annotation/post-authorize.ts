import { Authorize, AuthorizeType } from './authorize';

export const PostAuthorize = function (el: string) {
    return Authorize({ el, authorizeType: AuthorizeType.Post });
};
