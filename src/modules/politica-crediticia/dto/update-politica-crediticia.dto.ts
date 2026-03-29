import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class UpdatePoliticaCrediticiaDto {
  @ApiProperty({
    example: 2,
    description:
      'Situación crediticia BCRA máxima permitida (1 = normal, 5 = irrecuperable).',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  maxSituacionCrediticiaPermitida: number;

  @ApiProperty({
    example: 3,
    description: 'Cantidad máxima de entidades financieras con deuda activa.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  maxEntidadesConDeuda: number;

  @ApiProperty({
    example: 350000,
    description: 'Monto máximo de deuda total externa (en pesos).',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  maxDeudaTotalExterna: number;

  @ApiProperty({
    example: 6,
    description:
      'Cantidad de meses consecutivos sin deuda irregular requeridos en el historial.',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  mesesHistorialLimpioRequerido: number;
}
