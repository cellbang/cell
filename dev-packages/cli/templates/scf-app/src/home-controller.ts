import { Controller, Get, Text } from '@malagu/mvc/lib/node';

@Controller()
export class HomeController {
    
    @Get()
    @Text()
    home(): string {
        return 'Welcome to Malagu';
    }
}
