import {Controller, Get, Post, Body} from './common';
import {UsersService} from './app.service';

@Controller('/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('/')
  findAll() {

    console.log('UsersController.findAll called');
    
    return this.usersService.findAll();
  }
  @Post('/')
  create(@Body() body: { name: string }) {
    return this.usersService.create(body.name);
  }
}