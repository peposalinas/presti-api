import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateRecomendacionDto {
  @ApiProperty({
    example: true,
    description: 'true si el usuario aceptó o calificó para el producto recomendado, false si fue rechazado.',
  })
  @IsBoolean()
  exito: boolean;
}
