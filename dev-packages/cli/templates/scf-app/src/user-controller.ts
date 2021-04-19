import { Controller, Get, Param, Delete, Put, Post, Body } from '@malagu/mvc/lib/node';

export interface User {
    name: string;
    age: number;
}

const users = [ { name: 'Tom', age: 20 }, { name: 'Alice', age: 23 }]

@Controller('users')
export class UserController {
    
    @Get()
    list(): User[] {
        return users;
    }

    @Get(':name')
    get(@Param('name') name: string): User | undefined {
        for (const user of users) {
            if (user.name === name) {
                return user;
            }
        }
    }

    @Delete(':name')
    remove(@Param('name') name: string): void {
        const index = users.findIndex(user => user.name === name);
        if (index !== -1) {
            users.splice(index, 1);
        }
    }

    @Put()
    modify(@Body() user: User): void {
        const target = users.find(u => u.name == user.name);
        if (target) { 
            target.age = user.age;
        }
    }

    @Post()
    create(@Body() user: User): void {
        users.push(user);
    }

}
