import { Authorize } from './authorize';
import { AuthorizeType } from '../../common';

export const PreAuthorize = function (el: string) {
    return Authorize({ el, authorizeType: AuthorizeType.Pre });
};
