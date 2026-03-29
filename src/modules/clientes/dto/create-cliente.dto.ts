import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ModoExceso } from '../../suscripciones/enums/modo-exceso.enum';

export class CreateClienteDto {
  @ApiProperty({ example: 'Fintech SA', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'contacto@fintech.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'miPassword123' })
  @IsString()
  password: string;

  @ApiPropertyOptional({
    enum: ModoExceso,
    example: ModoExceso.RECHAZAR,
    description: 'RECHAZAR bloquea cuando se supera el límite. COBRAR permite el exceso y lo factura.',
  })
  @IsOptional()
  @IsEnum(ModoExceso)
  modoExceso?: ModoExceso;
}
