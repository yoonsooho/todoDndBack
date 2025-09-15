import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto, UpdatePostSequenceDto } from './dto/update-post.dto';
import { Post as PostEntity } from './post.entity';
import { ScheduleService } from 'src/schedule/schedule.service';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly scheduleService: ScheduleService,
  ) {}

  @Post()
  async create(
    @Query('scheduleId', new ParseIntPipe())
    scheduleId: number,
    @Body()
    createPostDto: CreatePostDto,
  ): Promise<PostEntity> {
    return this.postService.create({
      title: createPostDto.title,
      schedule_id: scheduleId,
    });
  }

  @Get()
  async findByScheduleId(
    @Query('scheduleId', new ParseIntPipe())
    scheduleId: number,
    @Req() req: Request,
  ) {
    const userId = req.user['sub'];
    const schedule = await this.scheduleService.findAllByUserId(userId);

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    // seq 순서로 정렬된 posts 조회
    const posts = await this.postService.findByScheduleOrderedBySeq(scheduleId);
    console.log('posts', posts);

    // posts가 없으면 빈 배열 반환
    return posts || [];
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostEntity> {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postService.remove(id);
  }

  // 순서 변경 API (드래그 앤 드롭)
  @Patch('reorder/:scheduleId')
  async updateSequence(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Body() updateSequenceDto: UpdatePostSequenceDto,
  ): Promise<{ message: string }> {
    await this.postService.updateSequence(
      scheduleId,
      updateSequenceDto.postSeqUpdates,
    );
    return { message: 'Posts 순서가 업데이트되었습니다.' };
  }

  // 특정 스케줄의 순서별 posts 조회
  @Get('schedule/:scheduleId/ordered')
  async findByScheduleOrdered(
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
  ): Promise<PostEntity[]> {
    return this.postService.findByScheduleOrderedBySeq(scheduleId);
  }
}
