import { Authorize } from './authorize';
import { AuthorizeType } from '../../common';

export const PostAuthorize = function (el: string) {
    return Authorize({ el, authorizeType: AuthorizeType.Post });
};
