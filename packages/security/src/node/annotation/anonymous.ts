import { Authorize } from './authorize';
import { AuthorizeType } from '../../common';

export const Anonymous = function () {
    return Authorize({ el: 'true', authorizeType: AuthorizeType.Pre });
};
