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
} from '@nestjs/common';
import { ContentItemService } from './content-item.service';
import { CreateContentItemDto } from './dto/create-content-item.dto';
import {
  UpdateContentItemDto,
  UpdateContentItemSequenceDto,
} from './dto/update-content-item.dto';
import { ContentItem } from './content-item.entity';

@Controller('content-items')
export class ContentItemController {
  constructor(private readonly contentItemService: ContentItemService) {}

  @Post()
  async create(
    @Body() createContentItemDto: CreateContentItemDto,
  ): Promise<ContentItem> {
    return this.contentItemService.create(createContentItemDto);
  }

  @Get()
  async findAll(@Query('postId') postId?: string): Promise<ContentItem[]> {
    if (postId) {
      // postId가 있으면 seq 순서로 정렬된 content-items 조회
      return this.contentItemService.findByPostOrderedBySeq(postId);
    }
    return this.contentItemService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ContentItem> {
    return this.contentItemService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContentItemDto: UpdateContentItemDto,
  ): Promise<ContentItem> {
    return this.contentItemService.update(id, updateContentItemDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.contentItemService.remove(id);
  }

  // 순서 변경 API (드래그 앤 드롭)
  @Patch('reorder/:postId')
  async updateSequence(
    @Param('postId') postId: string,
    @Body() updateSequenceDto: UpdateContentItemSequenceDto,
  ): Promise<{ message: string }> {
    await this.contentItemService.updateSequence(
      postId,
      updateSequenceDto.contentItemSeqUpdates,
    );
    return { message: 'Content items 순서가 업데이트되었습니다.' };
  }
}
