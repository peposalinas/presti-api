import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description: 'Mensaje o pregunta del usuario',
    example: '¿Qué situación crediticia tiene esta persona?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'CUIL de la persona a consultar (11 dígitos, sin guiones)',
    example: '20123456789',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, {
    message: 'El CUIL debe tener exactamente 11 dígitos numéricos',
  })
  cuil?: string;

  @ApiPropertyOptional({
    description: 'Contexto adicional para la consulta',
    example: 'El cliente solicita un préstamo personal de $500.000',
  })
  @IsOptional()
  @IsString()
  context?: string;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'Respuesta generada por la IA' })
  response: string;

  @ApiPropertyOptional({
    description: 'Fuentes de datos consultadas',
  })
  dataSources?: string[];
}
