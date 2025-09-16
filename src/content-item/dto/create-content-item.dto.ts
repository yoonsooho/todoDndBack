import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateContentItemDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsNumber()
  post_id: number;
}

export class CreateContentItemSequenceDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsNumber()
  post_id: number;

  @IsNotEmpty()
  @IsNumber()
  seq: number;
}
