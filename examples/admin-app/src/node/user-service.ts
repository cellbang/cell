import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
import { Rpc } from '@malagu/rpc';
import { Anonymous } from '@malagu/security/lib/node'
import { User } from './entity';
import { UserService } from '../common';

@Rpc(UserService)
@Anonymous()
export class UserServiceImpl implements UserService {
    
    @Transactional({ readOnly: true })
    list(): Promise<User[]> {
        const repo = OrmContext.getRepository(User);
        return repo.find();
    }

    @Transactional({ readOnly: true })
    get(id: number): Promise<User | null> {
        const repo = OrmContext.getRepository(User);
        return repo.findOneBy({ id });
    }

    @Transactional()
    async remove(id: number): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.delete(id);
    }

    @Transactional()
    async modify(user: User): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.update(user.id, user);
    }

    @Transactional()
    create(user: User): Promise<User> {
        const repo = OrmContext.getRepository(User);
        return repo.save(user);
    }

}
