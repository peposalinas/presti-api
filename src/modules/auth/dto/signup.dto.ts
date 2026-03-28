import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'Empresa SA' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'empresa@mail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'contraseña_segura', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
