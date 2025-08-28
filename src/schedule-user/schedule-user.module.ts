import { Module } from '@nestjs/common';
import { ScheduleUserService } from './schedule-user.service';
import { ScheduleUserController } from './schedule-user.controller';

@Module({
  controllers: [ScheduleUserController],
  providers: [ScheduleUserService],
})
export class ScheduleUserModule {}
