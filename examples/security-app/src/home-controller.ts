import { Controller, Get, Text } from '@malagu/mvc/lib/node';
import { Anonymous } from '@malagu/security/lib/node';

@Controller()
@Anonymous()
export class HomeController {
    
    @Get()
    @Text()
    home(): string {
        return 'Welcome to Malagu';
    }
}
