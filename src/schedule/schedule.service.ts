import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateScheduleDto } from 'src/schedule/dto/create-schedule.dto';
import { UpdateScheduleDto } from 'src/schedule/dto/update-schedule.dto';
import { Schedule } from 'src/schedule/schedule.entity';
import { User } from 'src/users/users.entity';
import { ScheduleUser } from 'src/schedule-user/entities/schedule-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ScheduleUser)
    private scheduleUserRepository: Repository<ScheduleUser>,
  ) {}

  /**
   * 스케줄 생성
   * - Schedule 생성 후
   * - ScheduleUser에 연결 (생성자는 canEdit: true)
   */
  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const user = await this.userRepository.findOneBy({
      id: createScheduleDto.usersId,
    });
    if (!user) throw new Error('User not found');

    // 1. 스케줄 생성
    const createdSchedule = this.scheduleRepository.create({
      title: createScheduleDto.title,
      startDate: createScheduleDto.startDate,
      endDate: createScheduleDto.endDate,
    });
    const savedSchedule = await this.scheduleRepository.save(createdSchedule);

    // 2. 스케줄-유저 연결
    const scheduleUser = this.scheduleUserRepository.create({
      user,
      schedule: savedSchedule,
      canEdit: true, // 생성자는 수정권한 있음
    });
    await this.scheduleUserRepository.save(scheduleUser);

    return savedSchedule;
  }

  /**
   * 내가 속한 스케줄 조회
   */
  async findAllByUserId(userId: string): Promise<Schedule[]> {
    const scheduleUsers = await this.scheduleUserRepository.find({
      where: { user: { id: userId } },
      relations: ['schedule'],
    });

    return scheduleUsers.map((su) => su.schedule);
  }

  /**
   * 스케줄 수정
   * - 권한 체크 (canEdit = true 인 경우만)
   */
  async updateByScheduleId(
    scheduleId: number,
    userId: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    // 1. ScheduleUser에서 권한 확인
    const scheduleUser = await this.scheduleUserRepository.findOne({
      where: { user: { id: userId }, schedule: { id: scheduleId } },
      relations: ['schedule'],
    });

    if (!scheduleUser) throw new Error('Schedule not found or not shared');
    if (!scheduleUser.canEdit) {
      throw new ForbiddenException(
        'You do not have permission to edit this schedule',
      );
    }

    // 2. 스케줄 업데이트
    const schedule = scheduleUser.schedule;
    if (updateScheduleDto.title) {
      schedule.title = updateScheduleDto.title;
    }
    if (updateScheduleDto.startDate) {
      schedule.startDate = updateScheduleDto.startDate;
    }
    if (updateScheduleDto.endDate) {
      schedule.endDate = updateScheduleDto.endDate;
    }

    return this.scheduleRepository.save(schedule);
  }

  /**
   * 스케줄 삭제
   * - 권한 체크 (canEdit = true 인 경우만)
   */
  async deleteByScheduleId(
    scheduleId: number,
    userId: string,
  ): Promise<boolean> {
    const scheduleUser = await this.scheduleUserRepository.findOne({
      where: { user: { id: userId }, schedule: { id: scheduleId } },
      relations: ['schedule'],
    });

    if (!scheduleUser) throw new Error('Schedule not found or not shared');
    if (!scheduleUser.canEdit) {
      throw new ForbiddenException(
        'You do not have permission to delete this schedule',
      );
    }

    const result = await this.scheduleRepository.delete(scheduleId);
    return result.affected !== 0;
  }
}
