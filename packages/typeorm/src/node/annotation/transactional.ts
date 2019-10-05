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
    readOnly?: boolean;
}
export namespace TransactionalOption {
    export function is(option: any): option is TransactionalOption {
        return option && (option.name !== undefined || option.isolation !== undefined || option.readOnly !== undefined);
    }
}

export interface TransactionalDecorator {
    (nameOrTransactionalOption?: string | TransactionalOption): MethodDecorator;
}

export const Transactional = <TransactionalDecorator>function (nameOrTransactionalOption?: string | TransactionalOption): MethodDecorator {
    const { name, isolation, propagation, readOnly } = getTransactionalOption(nameOrTransactionalOption);
    return (target: Object, methodName: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            if (propagation === Propagation.Required) {
                const em = OrmContext.getEntityManager(name);
                if (em && em.queryRunner && (em.queryRunner.isTransactionActive || readOnly)) {
                    return originalMethod.apply(this, args);
                }
            }
            const callback = async (entityManager: EntityManager) => {

                OrmContext.pushEntityManager(name!, entityManager);
                try {
                    return await originalMethod.apply(this, args);
                } finally {
                    OrmContext.popEntityManager(name!);
                }
            };
            if (readOnly) {
                return await callback(getConnection(name).manager);
            } else if (isolation) {
                return getConnection(name).manager.transaction(isolation, callback);
            } else {
                return getConnection(name).manager.transaction(callback);
            }
        };

    };
};

export function getTransactionalOption(nameOrTransactionalOption?: string | TransactionalOption) {
    const defaultOption = {
        name: DEFAULT_CONNECTION_NAME,
        propagation: Propagation.Required,
        readOnly: false
    };
    let option: TransactionalOption = defaultOption;
    if (TransactionalOption.is(nameOrTransactionalOption)) {
        option = { ...defaultOption, ...nameOrTransactionalOption };
    } else if (nameOrTransactionalOption) {
        option = { ...defaultOption, name: nameOrTransactionalOption };
    }

    return option;
}
