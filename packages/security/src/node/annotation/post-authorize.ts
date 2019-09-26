import { Authorize, AuthorizeType } from './authorize';

export const PostAuthorize = function (el: string) {
    return Authorize({ el, type: AuthorizeType.Post });
};
