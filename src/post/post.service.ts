import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Schedule } from 'src/schedule/schedule.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Schedule 존재 여부 확인
    const schedule = await this.scheduleRepository.findOne({
      where: { id: createPostDto.schedule_id },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Schedule with ID ${createPostDto.schedule_id} not found`,
      );
    }

    const post = this.postRepository.create({
      title: createPostDto.title,
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

    return this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }
}
