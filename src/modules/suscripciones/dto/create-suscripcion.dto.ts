import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TipoSuscripcion } from '../enums/tipo-suscripcion.enum';

export class CreateSuscripcionDto {
  @IsEnum(TipoSuscripcion)
  tipo: TipoSuscripcion;

  @IsDateString()
  startTimestamp: string;

  @IsOptional()
  @IsDateString()
  endTimestamp?: string;
}
