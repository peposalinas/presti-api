import { IsString, MaxLength, IsDateString, Length } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @Length(7, 11)
  cuil: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsDateString()
  fechaNacimiento: string;
}
