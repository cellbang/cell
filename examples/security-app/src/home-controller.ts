import { Controller, Get, Text } from '@celljs/mvc/lib/node';
import { Anonymous } from '@celljs/security/lib/node';

@Controller()
@Anonymous()
export class HomeController {
    
    @Get()
    @Text()
    home(): string {
        return 'Welcome to Cell';
    }
}
