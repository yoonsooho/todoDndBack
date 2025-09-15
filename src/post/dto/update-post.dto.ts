import { PartialType } from '@nestjs/mapped-types';
import { CreatePostInputClass } from './create-post.dto';
import { IsArray, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePostDto extends PartialType(CreatePostInputClass) {
  @IsOptional()
  @IsNumber()
  seq?: number;
}

export class PostSeqUpdateDto {
  @IsNumber()
  id: number;

  @IsNumber()
  seq: number;
}

export class UpdatePostSequenceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostSeqUpdateDto)
  postSeqUpdates: PostSeqUpdateDto[];
}
