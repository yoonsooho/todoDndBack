import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduleDto } from 'src/schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from 'src/schedule/dto/update-schedule.dto';
import { Schedule } from 'src/schedule/schedule.entity';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const user = await this.userRepository.findOneBy({
      id: createScheduleDto.userId,
    });
    if (!user) throw new Error('User not found');

    const createdSchedule = this.scheduleRepository.create({
      title: createScheduleDto.title,
      user,
    });

    return this.scheduleRepository.save(createdSchedule);
  }

  async findAllByUserId(userId: string): Promise<Schedule[]> {
    return this.scheduleRepository.find({
      where: {
        user: { id: userId },
      },
    });
  }

  async updateByScheduleId(
    id: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    // 1. Schedule + 기존 user 가져오기
    const schedule = await this.scheduleRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!schedule) throw new Error('Schedule not found');

    // 2. title 업데이트
    if (updateScheduleDto.title) {
      schedule.title = updateScheduleDto.title;
    }

    return this.scheduleRepository.save(schedule);
  }

  async deleteByScheduleId(scheduleId: number): Promise<boolean> {
    const result = await this.scheduleRepository.delete(scheduleId);
    return result.affected !== 0;
  }
}
