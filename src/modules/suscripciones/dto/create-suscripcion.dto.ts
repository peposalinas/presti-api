import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TipoSuscripcion } from '../enums/tipo-suscripcion.enum';

export class CreateSuscripcionDto {
  @ApiProperty({
    enum: TipoSuscripcion,
    example: TipoSuscripcion.PROFESSIONAL,
    description: 'Plan de suscripción a asignar al cliente.',
  })
  @IsEnum(TipoSuscripcion)
  tipo: TipoSuscripcion;

  @ApiProperty({
    example: '2025-01-01T00:00:00Z',
    description: 'Fecha y hora de inicio de la suscripción (ISO 8601).',
  })
  @IsDateString()
  startTimestamp: string;

  @ApiPropertyOptional({
    example: '2026-01-01T00:00:00Z',
    description: 'Fecha y hora de vencimiento (ISO 8601). Si se omite, la suscripción no tiene fecha de fin.',
  })
  @IsOptional()
  @IsDateString()
  endTimestamp?: string;
}
