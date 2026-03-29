import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateRecomendacionDto {
  @ApiProperty({
    example: '20123456789',
    minLength: 11,
    maxLength: 11,
    description: 'CUIL del solicitante (11 dígitos, sin guiones). Se consulta el BCRA con este identificador.',
  })
  @IsString()
  @Length(11, 11)
  cuil: string;
}
