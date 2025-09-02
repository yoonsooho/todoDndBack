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
import { UpdateContentItemDto } from './dto/update-content-item.dto';
import { ContentItem } from './content-item.entity';

@Controller('content-items')
export class ContentItemController {
  constructor(private readonly contentItemService: ContentItemService) {}

  @Post()
  async create(@Body() createContentItemDto: CreateContentItemDto): Promise<ContentItem> {
    return this.contentItemService.create(createContentItemDto);
  }

  @Get()
  async findAll(
    @Query('postId', new ParseIntPipe({ optional: true })) postId?: number,
  ): Promise<ContentItem[]> {
    if (postId) {
      return this.contentItemService.findByPostId(postId);
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
}
