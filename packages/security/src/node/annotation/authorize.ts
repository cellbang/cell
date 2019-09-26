import { METADATA_KEY } from '../constants';

export enum AuthorizeType {
    Pre= 'Pre', Post= 'Post'
}

export interface AuthorizeMetadata {
    el: string;
    type: AuthorizeType;
}

export interface AuthorizeOption {
    el: string;
    type: AuthorizeType;
}

export namespace AuthorizeOption {
    export function is(option: any): option is AuthorizeOption {
        return option && (option.el !== undefined || option.type);
    }
}

export const Authorize = function (elOrAuthorizeOption: string | AuthorizeOption): any {
    const option = getAuthorizeOption(elOrAuthorizeOption);
    return (target: any, targetKey?: string, descriptor?: TypedPropertyDescriptor<Function>) => {
        if (targetKey) {
            const metadatas: AuthorizeMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.authorize, target.constructor, targetKey) || [];
            metadatas.push({ ...option });
            Reflect.defineMetadata(METADATA_KEY.authorize, metadatas, target.constructor, targetKey);
        } else {
            const metadatas: AuthorizeMetadata[] = Reflect.getOwnMetadata(METADATA_KEY.authorize, target.constructor) || [];
            metadatas.push({ ...option });
            Reflect.defineMetadata(METADATA_KEY.authorize, metadatas, target.constructor);
        }
    };

};

export function getAuthorizeOption(elOrAuthorizeOption: string | AuthorizeOption) {
    let option: AuthorizeOption;
    if (AuthorizeOption.is(elOrAuthorizeOption)) {
        option = { ...{ type: AuthorizeType.Pre }, ...elOrAuthorizeOption };
    } else {
        option = { type: AuthorizeType.Pre, el: elOrAuthorizeOption };
    }
    return option;
}
