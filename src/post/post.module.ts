import { Module } from '@nestjs/common';
import { PostController } from 'src/post/post.controller';
import { PostService } from 'src/post/post.service';

@Module({
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
