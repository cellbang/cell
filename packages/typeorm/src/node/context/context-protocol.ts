import { Context, AttributeScope } from '@malagu/core/lib/node';
import { EntityManager, ObjectType, EntitySchema, Repository, TreeRepository, MongoRepository } from 'typeorm';
import { DEFAULT_CONNECTION_NAME } from '../../common';

export const CURRENT_ORM_CONTEXT_REQUEST_KEY = 'CurrentOrmContextRequest';

export namespace OrmContext {

    export function getEntityManager(name = DEFAULT_CONNECTION_NAME): EntityManager {
        const entityManagerMap = Context.getAttr<Map<string, EntityManager[]>>(CURRENT_ORM_CONTEXT_REQUEST_KEY, AttributeScope.Request);
        if (entityManagerMap) {
            const entityManagers = entityManagerMap.get(name);
            if (entityManagers && entityManagers.length > 0) {
                return entityManagers[entityManagers.length - 1];
            }
        }
        return <EntityManager><unknown>undefined;
    }

    export function getRepository<Entity>(target: ObjectType<Entity>|EntitySchema<Entity>|string, name?: string): Repository<Entity>  {
        return getEntityManager(name).getRepository(target);
    }

    export function getTreeRepository<Entity>(target: ObjectType<Entity>|EntitySchema<Entity>|string, name?: string): TreeRepository<Entity>  {
        return getEntityManager(name).getTreeRepository(target);
    }

    export function getMongoRepository<Entity>(target: ObjectType<Entity>|EntitySchema<Entity>|string, name?: string): MongoRepository<Entity>  {
        return getEntityManager(name).getMongoRepository(target);
    }

    export function getCustomRepository<T>(customRepository: ObjectType<T>, name?: string): T {
        return getEntityManager(name).getCustomRepository(customRepository);
    }

    export function pushEntityManager(name: string, entityManager: EntityManager): void {
        let entityManagerMap = Context.getAttr<Map<string, EntityManager[]>>(CURRENT_ORM_CONTEXT_REQUEST_KEY, AttributeScope.Request);
        if (!entityManagerMap) {
            entityManagerMap = new Map<string, EntityManager[]>();
            entityManagerMap.set(name, []);
            Context.setAttr(CURRENT_ORM_CONTEXT_REQUEST_KEY, entityManagerMap);
        }
        entityManagerMap.get(name)!.push(entityManager);
    }

    export function popEntityManager(name: string): EntityManager | undefined {
        const entityManagerMap = Context.getAttr<Map<string, EntityManager[]>>(CURRENT_ORM_CONTEXT_REQUEST_KEY, AttributeScope.Request);
        if (entityManagerMap) {
            const entityManagers = entityManagerMap.get(name);
            if (entityManagers && entityManagers.length > 0) {
                return entityManagers.pop();
            }
        }
    }

}
