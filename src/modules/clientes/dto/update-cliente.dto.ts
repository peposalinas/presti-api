import { IsString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { Suscripcion } from '../enums/suscripcion.enum';

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEnum(Suscripcion)
  suscripcion?: Suscripcion;
}
