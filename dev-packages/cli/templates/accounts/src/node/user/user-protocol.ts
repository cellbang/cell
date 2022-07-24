import { Identity, User } from '../entity';
export const UserRepository = Symbol('UserRepository');

export interface UserRepository {

    getByConnectionAndIdentifier(connection: string, identity: string): Promise<User | null>;

    getByEmail(email: string): Promise<User | null>;

    getByUsername(username: string): Promise<User | null>;

    get(id: number): Promise<User | null>;

    update(user: User): Promise<User>;

    create(user: User, identity: Identity): Promise<User>;

}

