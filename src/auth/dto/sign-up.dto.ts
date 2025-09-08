import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { IsString, IsNotEmpty } from 'class-validator';

export class SignUpDto extends CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
