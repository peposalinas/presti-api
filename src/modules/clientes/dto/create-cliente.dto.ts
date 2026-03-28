import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Suscripcion } from '../enums/suscripcion.enum';

export class CreateClienteDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  suscripcion?: Suscripcion;
}
