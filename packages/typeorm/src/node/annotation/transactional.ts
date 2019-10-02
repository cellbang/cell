import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';
import { DEFAULT_CONNECTION_NAME } from '../../common';
import { EntityManager, getConnection } from 'typeorm';
import { OrmContext } from '../context';

export enum Propagation {
    Required, RequiresNew
}

export interface TransactionalOption {
    name?: string;
    isolation?: IsolationLevel;
    propagation?: Propagation;
}
export namespace TransactionalOption {
    export function is(option: any): option is TransactionalOption {
        return option && (option.name !== undefined || option.isolation !== undefined);
    }
}

export interface TransactionalDecorator {
    (nameOrTransactionalOption?: string | TransactionalOption): MethodDecorator;
}

export const Transactional = <TransactionalDecorator>function (nameOrTransactionalOption?: string | TransactionalOption): MethodDecorator {
    const { name, isolation, propagation } = getTransactionalOption(nameOrTransactionalOption);
    return (target: Object, methodName: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args: any[]) {
            if (propagation === Propagation.Required) {
                if (OrmContext.getEntityManager(name)) {
                    return originalMethod.apply(this, args);
                }
            }
            const transactionCallback = (entityManager: EntityManager) => {

                OrmContext.pushEntityManager(name!, entityManager);
                try {
                    return originalMethod.apply(this, args);
                } finally {
                    OrmContext.popEntityManager(name!);
                }
            };
            if (isolation) {
                return getConnection(name).manager.transaction(isolation, transactionCallback);
            } else {
                return getConnection(name).manager.transaction(transactionCallback);
            }
        };

    };
};

export function getTransactionalOption(nameOrTransactionalOption?: string | TransactionalOption) {
    let option: TransactionalOption = {};
    if (TransactionalOption.is(nameOrTransactionalOption)) {
        option = { ...nameOrTransactionalOption };
    } else if (nameOrTransactionalOption) {
        option = { name: nameOrTransactionalOption };
    }
    option = { ...{ name: DEFAULT_CONNECTION_NAME, propagation: Propagation.Required }, ...option };

    return option;
}
