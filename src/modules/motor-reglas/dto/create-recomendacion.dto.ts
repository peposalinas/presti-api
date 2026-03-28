import { IsString, Length } from 'class-validator';

export class CreateRecomendacionDto {
  @IsString()
  @Length(11, 11)
  cuil: string;
}
