export const UserService = Symbol('UserService');

export interface UserService {

    list(): Promise<User[]>;

    get(id: number): Promise<User | undefined>;

    remove(id: number): Promise<void>

    modify(user: User): Promise<void>;

    create(user: User): Promise<User>;
}

export interface User {
    
    id: number;

    name: string;

    age: number;
}
