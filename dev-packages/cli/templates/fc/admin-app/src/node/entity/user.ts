import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { User as IUser } from '../../common';

@Entity()
export class User implements IUser {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    age: number;
}
