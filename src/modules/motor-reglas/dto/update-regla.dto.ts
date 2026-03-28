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
  @IsOptional()
  @IsEnum(Parametro)
  parametro?: Parametro;

  @IsOptional()
  @IsEnum(Operador)
  operador?: Operador;

  @IsOptional()
  @IsString()
  valor?: string;

  @IsOptional()
  @IsEnum(TipoValor)
  tipoValor?: TipoValor;

  @IsOptional()
  @IsInt()
  @Min(1)
  prioridad?: number;

  @IsOptional()
  @IsUUID()
  productoId?: string;
}
