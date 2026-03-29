import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, Length } from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: '20123456789', minLength: 7, maxLength: 11, description: 'CUIL del usuario (11 dígitos)' })
  @IsString()
  @Length(7, 11)
  cuil: string;

  @ApiProperty({ example: 'García Juan', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  nombre: string;
}
