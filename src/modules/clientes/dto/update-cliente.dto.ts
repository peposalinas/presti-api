import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ModoExceso } from '../../suscripciones/enums/modo-exceso.enum';

export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsEnum(ModoExceso)
  modoExceso?: ModoExceso;
}
