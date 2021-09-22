import { Identity, User } from '../entity';
export const UserRepository = Symbol('UserRepository');

export interface UserRepository {

    getByConnectionAndIdentifier(connection: string, identity: string): Promise<User | undefined>;

    getByEmail(email: string): Promise<User | undefined>;

    getByUsername(username: string): Promise<User | undefined>;

    get(id: number): Promise<User | undefined>;

    update(user: User): Promise<User>;

    create(user: User, identity: Identity): Promise<User>;

}

