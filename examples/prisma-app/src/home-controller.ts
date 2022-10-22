import { Controller, Get } from '@malagu/mvc/lib/node';
import { PrismaClient } from '../prisma-client';
@Controller()
export class HomeController {
    @Get()
    async query() {
        const prisma = new PrismaClient();
        return await prisma.user.findMany({
            include: {
                posts: true,
            },
        });
    }


    @Get('create')
    async create() {
        const prisma = new PrismaClient();
        const user = await prisma.user.create({
            data: {
                name: 'Bob',
                email: 'bob@prisma.io',
                posts: {
                    create: {
                        title: 'Hello World',
                    },
                },
            },
        });
        return user;
    }
}
