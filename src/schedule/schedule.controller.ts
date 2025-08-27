import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Request } from 'express';

@UseGuards(AccessTokenGuard)
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async findAll(@Req() req: Request) {
    return this.scheduleService.findAllByUserId(req.user['sub']);
  }

  @Post()
  async create(
    @Req() req: Request,
    @Body() createScheduleDto: CreateScheduleDto,
  ) {
    return this.scheduleService.create({
      ...createScheduleDto,
      userId: req.user['sub'],
    });
  }

  @Patch(':scheduleId')
  async update(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.updateByScheduleId(
      scheduleId,
      updateScheduleDto,
    );
  }

  @Delete(':scheduleId')
  async remove(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return this.scheduleService.deleteByScheduleId(scheduleId);
  }
}
