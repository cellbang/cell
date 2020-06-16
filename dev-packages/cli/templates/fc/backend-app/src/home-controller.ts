import { Controller, Get, View, TextView } from '@malagu/mvc/lib/node';

@Controller()
export class HomeController {
    
    @Get()
    @View(TextView.VIEW_NAME)
    home(): string {
        return 'Welcome to Malagu';
    }
}
