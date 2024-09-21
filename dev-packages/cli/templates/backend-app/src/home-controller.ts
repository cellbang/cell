import { Controller, Get, Text } from '@celljs/mvc/lib/node';

@Controller()
export class HomeController {
    
    @Get()
    @Text()
    home(): string {
        return 'Welcome to Cell';
    }
}
