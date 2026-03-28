import { IsBoolean, IsDateString, IsString, Length } from 'class-validator';

export class CreateRecomendacionDto {
  @IsString()
  @Length(11, 11)
  cuil: string;

  @IsString()
  nombre: string;

  @IsDateString()
  fechaNacimiento: string;

  @IsBoolean()
  update: boolean;
}
