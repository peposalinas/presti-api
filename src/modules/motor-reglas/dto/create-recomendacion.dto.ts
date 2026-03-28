import { IsBoolean, IsDateString } from 'class-validator';

export class CreateRecomendacionDto {
  @IsDateString()
  timestamp: string;

  @IsBoolean()
  exito: boolean;
}
