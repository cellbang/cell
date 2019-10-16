import { Controller, Get, Param, Delete, Put, Post, Body } from '@malagu/core/lib/node';
import { Transactional, OrmContext } from '@malagu/typeorm/lib/node';
import { User } from './entity';
import { DeleteResult, UpdateResult } from 'typeorm';

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
    get(@Param('id') id: number): Promise<User | undefined> {
        const repo = OrmContext.getRepository(User);
        return repo.findOne(id);
    }

    @Delete(':id')
    @Transactional()
    reomve(@Param('id') id: number): Promise<DeleteResult> {
        const repo = OrmContext.getRepository(User);
        return repo.delete(id);
    }

    @Put()
    @Transactional()
    async modify(@Body() user: User): Promise<UpdateResult> {
        const repo = OrmContext.getRepository(User);
        return repo.update(user.id, user);
    }

    @Post()
    @Transactional()
    create(@Body() user: User): Promise<User> {
        const repo = OrmContext.getRepository(User);
        return repo.save(user);
    }

}
