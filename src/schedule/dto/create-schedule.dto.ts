import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  usersId: string; // user relation은 id만 받아오는 경우가 일반적임

  @IsDateString()
  startDate: string; // Date를 직접 받기보단 string으로 받아서 변환하는 게 일반적

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
