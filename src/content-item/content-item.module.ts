import { Module } from '@nestjs/common';
import { ContentItemService } from './content-item.service';
import { ContentItemController } from './content-item.controller';

@Module({
  providers: [ContentItemService],
  controllers: [ContentItemController],
})
export class ContentItemModule {}
