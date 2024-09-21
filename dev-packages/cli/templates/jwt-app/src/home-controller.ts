import { Autowired } from '@celljs/core';
import { JwtService } from '@celljs/jwt';
import { Controller, Get, Text } from '@celljs/mvc/lib/node';

@Controller()
export class HomeController {

    @Autowired(JwtService)
    protected readonly jwtService: JwtService;
    
    @Get()
    @Text()
    home(): string {
        return 'Welcome to Cell';
    }

    @Get('/login')
    @Text()
    login(): Promise<string> {
        const token = this.jwtService.sign({ name: 'cell' });
        return token;
    }
}
