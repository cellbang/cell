import {Entity, Column } from 'typeorm';
import { BaseEntity } from './base-entity';

export class Connection extends BaseEntity {

    @Column()
    name: string;

}

@Entity()
export class Database extends Connection {

    @Column()
    requiresUsername: boolean;

    @Column()
    usernameMaxLength: number;

    @Column()
    usernameMinLength: boolean;

    @Column()
    disableSignUps: boolean;

}

@Entity()
export class Social extends Connection {

    @Column()
    strategy: string;

    @Column()
    clientId: string;

    @Column()
    clientSecret: string;

    @Column()
    scopes: string[];

    @Column()
    redirectUri: string;

    @Column()
    authorizationGrantType: string;

    @Column()
    clientAuthenticationMethod: string;

}
