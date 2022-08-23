import { Autowired } from '@malagu/core';
import { JwtService } from '@malagu/jwt';
import { Controller, Get, Text } from '@malagu/mvc/lib/node';

@Controller()
export class HomeController {

    @Autowired(JwtService)
    protected readonly jwtService: JwtService;
    
    @Get()
    @Text()
    home(): string {
        return 'Welcome to Malagu';
    }

    @Get('/login')
    @Text()
    login(): Promise<string> {
        const token = this.jwtService.sign({ name: 'malagu' });
        return token;
    }
}
