import { Component } from '@malagu/core';
import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
import { Identity, User } from '../entity';
import { UserNotFoundError } from '../error';
import { plainToClassFromExist, classToPlain } from 'class-transformer';
import { UserRepository } from './user-protocol';

@Component(UserRepository)
export class UserRepositoryImpl implements UserRepository {

    @Transactional({ readOnly: true })
    getByConnectionAndIdentifier(connection: string, identifier: string): Promise<User | undefined> {
        const repo = OrmContext.getRepository(User);

        const identityQb = OrmContext.getRepository(Identity).createQueryBuilder('identity')
            .select('identity.userId')
            .where('identity.identifier = :identifier and identity.connection = :connection', { connection, identifier });
        return repo.createQueryBuilder('user')
            .where(`user.id IN (${identityQb.getQuery()})`)
            .setParameters(identityQb.getParameters())
            .getOne();

    }

    @Transactional({ readOnly: true })
    getByEmail(email: string): Promise<User | undefined> {
        const repo = OrmContext.getRepository(User);
        return repo.createQueryBuilder('user')
            .where('user.email = :email', { email })
            .getOne();
    }

    @Transactional({ readOnly: true })
    getByUsername(username: string): Promise<User | undefined> {
        const repo = OrmContext.getRepository(User);
        return repo.createQueryBuilder('user')
            .where('user.username = :email', { username })
            .getOne();
    }

    @Transactional({ readOnly: true })
    async get(id: number): Promise<User> {
        const repo = OrmContext.getRepository(User);
        const user = await repo.findOne(id);
        if (user) {
            return user;
        }
        throw new UserNotFoundError(id);
    }

    @Transactional()
    async update(user: User): Promise<User> {
        const repo = OrmContext.getRepository(User);
        const oldUser = await repo.findOne(user.id);
        if (oldUser) {
            const newUser = plainToClassFromExist(oldUser, classToPlain(user));
            return repo.save(newUser);
        }
        throw new UserNotFoundError(user.id);
    }

    @Transactional()
    async create(user: User, identity: Identity): Promise<User> {
        const userRepo = OrmContext.getRepository(User);
        const identityRepo = OrmContext.getRepository(Identity);
        const newUser = await userRepo.save(user);
        identity.userId = newUser.id;
        await identityRepo.save(identity);
        return newUser;
    }

}
