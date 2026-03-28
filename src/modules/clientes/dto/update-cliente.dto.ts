import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ModoExceso } from '../../suscripciones/enums/modo-exceso.enum';

export class UpdateClienteDto {
  @ApiPropertyOptional({ example: 'Fintech SA', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    enum: ModoExceso,
    example: ModoExceso.RECHAZAR,
    description: 'RECHAZAR bloquea cuando se supera el límite. COBRAR permite el exceso y lo factura.',
  })
  @IsOptional()
  @IsEnum(ModoExceso)
  modoExceso?: ModoExceso;
}
