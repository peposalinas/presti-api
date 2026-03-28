import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, IsString, Min } from "class-validator";

export class ObtenerRecomendacionesDto {
  @ApiProperty({
    example: 25,
    description: "Edad del usuario evaluado",
  })
  @IsInt()
  @Min(0)
  edad: number;

  @ApiProperty({
    example: "soltero",
    description: "Estado civil declarado por el usuario",
  })
  @IsString()
  estadoCivil: string;

  @ApiProperty({
    example: 1000000,
    description: "Ingreso mensual del usuario",
  })
  @IsNumber()
  @Min(0)
  ingreso: number;
}
