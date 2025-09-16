import { PartialType } from '@nestjs/mapped-types';
import { CreateContentItemDto } from './create-content-item.dto';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContentItemDto extends PartialType(CreateContentItemDto) {
  @IsOptional()
  @IsNumber()
  seq?: number;
}

export class ContentItemSeqUpdateDto {
  @IsNumber()
  id: number;

  @IsNumber()
  seq: number;
}

export class UpdateContentItemSequenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentItemSeqUpdateDto)
  contentItemSeqUpdates: ContentItemSeqUpdateDto[];
}
