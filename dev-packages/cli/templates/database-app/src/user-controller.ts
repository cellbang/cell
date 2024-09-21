import { Controller, Get, Param, Delete, Put, Post, Body } from '@celljs/mvc/lib/node';
import { Transactional, OrmContext } from '@celljs/typeorm/lib/node';
import { User } from './entity';

@Controller('users')
export class UserController {
    
    @Get()
    @Transactional({ readOnly: true })
    list(): Promise<User[]> {
        const repo = OrmContext.getRepository(User);
        return repo.find();
    }

    @Get(':id')
    @Transactional({ readOnly: true })
    get(@Param('id') id: number): Promise<User | null> {
        const repo = OrmContext.getRepository(User);
        return repo.findOneBy({ id });
    }

    @Delete(':id')
    @Transactional()
    async remove(@Param('id') id: number): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.delete(id);
    }

    @Put()
    @Transactional()
    async modify(@Body() user: User): Promise<void> {
        const repo = OrmContext.getRepository(User);
        await repo.update(user.id, user);
    }

    @Post()
    @Transactional()
    create(@Body() user: User): Promise<User> {
        const repo = OrmContext.getRepository(User);
        return repo.save(user);
    }

}
