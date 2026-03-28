import { IsBoolean } from 'class-validator';

export class UpdateRecomendacionDto {
  @IsBoolean()
  exito: boolean;
}
