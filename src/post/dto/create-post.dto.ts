import { IsNotEmpty, IsString, IsNumber, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsNotEmpty()
  @IsNumber()
  schedule_id: number;
}
