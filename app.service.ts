import { Injectable } from "./common";
@Injectable()
export class UsersService {
  private users = [{ id: 1, name: 'John Doe' }];

  async findAll() {
    return this.users;
  }


  async create(name: string) {
    const id = this.users.length + 1;
    const user = { id, name };
    this.users.push(user);
    return user;
  }
}