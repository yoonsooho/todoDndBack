import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { Schedule } from 'src/schedule/schedule.entity';
import { User } from 'src/users/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Schedule, User, ScheduleUser])],
  providers: [ScheduleService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
