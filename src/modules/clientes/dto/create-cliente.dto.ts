import { IsEmail, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ModoExceso } from '../../suscripciones/enums/modo-exceso.enum';

export class CreateClienteDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(ModoExceso)
  modoExceso?: ModoExceso;
}
