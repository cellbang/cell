import { AuthorizeType } from '../../common';
import { Authorize } from './authorize';

export const Authenticated = function () {
    return Authorize({ el: 'authenticated', authorizeType: AuthorizeType.Pre });
};
