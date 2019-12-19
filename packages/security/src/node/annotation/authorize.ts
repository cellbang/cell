import { METADATA_KEY } from '../constants';
import { Policy, PolicyType } from '../access';

export enum AuthorizeType {
    Pre= 'Pre', Post= 'Post'
}

export interface ElOption {
    el: string;
    authorizeType: AuthorizeType;
}

export namespace ElOption {
    export function is(option: any): option is ElOption {
        return option && (option.el !== undefined || option.authorizeType);
    }
}

export const Authorize = function (elOrElOptionOrPolicy: string | ElOption | Policy) {
    const policy = getPolicy(elOrElOptionOrPolicy);
    return (target: any, targetKey?: string, descriptor?: TypedPropertyDescriptor<Function>) => {
        if (targetKey) {
            const policies: Policy[] = Reflect.getOwnMetadata(METADATA_KEY.authorize, target.constructor, targetKey) || [];
            policies.push(policy);
            Reflect.defineMetadata(METADATA_KEY.authorize, policies, target.constructor, targetKey);
        } else {
            const policies: Policy[] = Reflect.getOwnMetadata(METADATA_KEY.authorize, target.constructor) || [];
            policies.push(policy);
            Reflect.defineMetadata(METADATA_KEY.authorize, policies, target);
        }
    };

};

export function getPolicy(elOrElOptionOrPolicy: string | ElOption | Policy) {
    let policy: Policy;
    if (typeof elOrElOptionOrPolicy === 'string') {
        policy = { authorizeType: AuthorizeType.Pre, el: elOrElOptionOrPolicy, type: PolicyType.El };
    } else {
        policy = { authorizeType: AuthorizeType.Pre, type: PolicyType.El, ...elOrElOptionOrPolicy};
    }
    return policy;
}
