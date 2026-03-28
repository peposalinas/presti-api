import { IsString, MaxLength, IsDateString, IsOptional } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;
}
