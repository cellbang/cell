import { METADATA_KEY } from '../constants';
import { AuthorizeType, Policy, PolicyType } from '../../common';

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
    return (target: any, targetKey?: string | symbol, descriptor?: any) => {
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
    let policy = <Policy>elOrElOptionOrPolicy;
    if (typeof elOrElOptionOrPolicy === 'string') {
        policy = { authorizeType: AuthorizeType.Pre, el: elOrElOptionOrPolicy, type: PolicyType.el };
    } else if (elOrElOptionOrPolicy.el) {
        policy = { type: PolicyType.el, ...elOrElOptionOrPolicy};
    }
    return policy;
}
