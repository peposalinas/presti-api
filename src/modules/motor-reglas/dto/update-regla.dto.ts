import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Operador } from '../enums/operador.enum';
import { Parametro } from '../enums/parametro.enum';
import { TipoValor } from '../enums/tipo-valor.enum';

export class UpdateReglaDto {
  @ApiPropertyOptional({ enum: Parametro, example: Parametro.EDAD })
  @IsOptional()
  @IsEnum(Parametro)
  parametro?: Parametro;

  @ApiPropertyOptional({ enum: Operador, example: Operador.MAYOR_O_IGUAL })
  @IsOptional()
  @IsEnum(Operador)
  operador?: Operador;

  @ApiPropertyOptional({ example: '18', description: 'Valor umbral como string.' })
  @IsOptional()
  @IsString()
  valor?: string;

  @ApiPropertyOptional({ enum: TipoValor, example: TipoValor.NUMERO })
  @IsOptional()
  @IsEnum(TipoValor)
  tipoValor?: TipoValor;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  prioridad?: number;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  productoId?: string;
}
