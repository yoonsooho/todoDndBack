import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { UpdatePostDto } from './dto/update-post.dto';
import { Schedule } from 'src/schedule/schedule.entity';
import { CreatePostInputClass } from './dto/create-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createPostDto: CreatePostInputClass): Promise<Post> {
    // Schedule 존재 여부 확인
    const schedule = await this.scheduleRepository.findOne({
      where: { id: createPostDto.schedule_id },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Schedule with ID ${createPostDto.schedule_id} not found`,
      );
    }

    // 해당 스케줄의 가장 큰 seq 값 조회하여 +1로 설정 (seq 중복 방지)
    const maxSeqResult = await this.postRepository
      .createQueryBuilder('post')
      .select('MAX(post.seq)', 'maxSeq')
      .where('post.schedule.id = :scheduleId', {
        scheduleId: createPostDto.schedule_id,
      })
      .getRawOne();

    const newSeq = (maxSeqResult?.maxSeq || 0) + 1;

    const post = this.postRepository.create({
      title: createPostDto.title,
      seq: newSeq,
      schedule: schedule,
    });

    return this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['schedule', 'contentItems'],
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['schedule', 'contentItems'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findByScheduleId(scheduleId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { schedule: { id: scheduleId } },
      relations: ['schedule', 'contentItems'],
    });
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);

    if (updatePostDto.schedule_id) {
      const schedule = await this.scheduleRepository.findOne({
        where: { id: updatePostDto.schedule_id },
      });

      if (!schedule) {
        throw new NotFoundException(
          `Schedule with ID ${updatePostDto.schedule_id} not found`,
        );
      }

      post.schedule = schedule;
    }

    if (updatePostDto.title) {
      post.title = updatePostDto.title;
    }

    if (updatePostDto.seq !== undefined) {
      post.seq = updatePostDto.seq;
    }

    return this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }

  // 순서 변경 메서드 (드래그 앤 드롭용)
  async updateSequence(
    scheduleId: number,
    postSeqUpdates: { id: number; seq: number }[],
  ): Promise<void> {
    await this.postRepository.manager.transaction(async (manager) => {
      for (const update of postSeqUpdates) {
        await manager.update(Post, update.id, { seq: update.seq });
      }
    });
  }

  // 특정 스케줄의 posts를 seq 순서로 조회
  async findByScheduleOrderedBySeq(scheduleId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { schedule: { id: scheduleId } },
      relations: ['schedule', 'contentItems'],
      order: { seq: 'ASC' },
    });
  }
}
