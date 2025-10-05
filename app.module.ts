import { Module } from "./common";
import { UsersController } from "./app.controller";
import { UsersService } from "./app.service";

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class AppModule {}