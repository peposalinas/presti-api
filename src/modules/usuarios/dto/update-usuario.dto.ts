import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}
