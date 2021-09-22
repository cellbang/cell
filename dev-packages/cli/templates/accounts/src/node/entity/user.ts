import { Entity, Column } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from './base-entity';

@Entity()
export class Identity extends BaseEntity {

    @Column()
    userId: number;

    @Column()
    provider: string;

    @Column()
    connection: string;

    @Column()
    isSocial: boolean;

    @Column()
    identifier: string;

}

@Entity()
export class User extends BaseEntity {

    @Column({ length: 256, nullable: true })
    email?: string;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ length: 128, nullable: true })
    username?: string;

    @Column({ length: 64, nullable: true })
    phoneNumber?: string;

    @Column({ default: false })
    phoneVerified: boolean;

    @Column({ length: 512, nullable: true  })
    appMetadata?: string;

    @Column({ length: 512, nullable: true })
    userMetadata?: string;

    @Column({ length: 512, nullable: true })
    picture?: string;

    @Column({ length: 64, nullable: true  })
    nickname?: string;

    @Column({ nullable: true })
    multifactor?: string;

    @Column({ length: 32, nullable: true })
    lastIp?: string;

    @Column({ nullable: true })
    lastLogin?: Date;

    @Column({ default: 0 })
    loginsCount: number;

    @Column({ default: false })
    blocked: boolean;

    @Column({ length: 256, nullable: true })
    @Exclude()
    password!: string;
}
