import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentItem } from './content-item.entity';
import { CreateContentItemDto } from './dto/create-content-item.dto';
import { UpdateContentItemDto } from './dto/update-content-item.dto';
import { Post } from 'src/post/post.entity';

@Injectable()
export class ContentItemService {
  constructor(
    @InjectRepository(ContentItem)
    private readonly contentItemRepository: Repository<ContentItem>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createContentItemDto: CreateContentItemDto): Promise<ContentItem> {
    // Post 존재 여부 확인
    const post = await this.postRepository.findOne({
      where: { id: createContentItemDto.post_id },
    });

    if (!post) {
      throw new NotFoundException(
        `Post with ID ${createContentItemDto.post_id} not found`,
      );
    }

    const contentItem = this.contentItemRepository.create({
      text: createContentItemDto.text,
      post: post,
    });

    return this.contentItemRepository.save(contentItem);
  }

  async findAll(): Promise<ContentItem[]> {
    return this.contentItemRepository.find({
      relations: ['post'],
    });
  }

  async findOne(id: number): Promise<ContentItem> {
    const contentItem = await this.contentItemRepository.findOne({
      where: { id },
      relations: ['post'],
    });

    if (!contentItem) {
      throw new NotFoundException(`ContentItem with ID ${id} not found`);
    }

    return contentItem;
  }

  async findByPostId(postId: number): Promise<ContentItem[]> {
    return this.contentItemRepository.find({
      where: { post: { id: postId } },
      relations: ['post'],
    });
  }

  async update(id: number, updateContentItemDto: UpdateContentItemDto): Promise<ContentItem> {
    const contentItem = await this.findOne(id);

    if (updateContentItemDto.post_id) {
      const post = await this.postRepository.findOne({
        where: { id: updateContentItemDto.post_id },
      });

      if (!post) {
        throw new NotFoundException(
          `Post with ID ${updateContentItemDto.post_id} not found`,
        );
      }

      contentItem.post = post;
    }

    if (updateContentItemDto.text) {
      contentItem.text = updateContentItemDto.text;
    }

    return this.contentItemRepository.save(contentItem);
  }

  async remove(id: number): Promise<void> {
    const contentItem = await this.findOne(id);
    await this.contentItemRepository.remove(contentItem);
  }
}
