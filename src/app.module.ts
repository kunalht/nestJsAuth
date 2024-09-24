import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
