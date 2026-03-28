import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { TipoProducto } from "../enums/tipo-producto.enum";

export class UpdateProductoDto {
  @ApiPropertyOptional({ example: "Prestamo personal actualizado" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    enum: TipoProducto,
    example: TipoProducto.MICROPRESTAMO,
  })
  @IsOptional()
  @IsEnum(TipoProducto)
  tipo?: TipoProducto;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tasaMin?: number;

  @ApiPropertyOptional({ example: 40 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tasaMax?: number;

  @ApiPropertyOptional({ example: 120000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoMin?: number;

  @ApiPropertyOptional({ example: 2500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  montoMax?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cuotasMin?: number;

  @ApiPropertyOptional({ example: 36 })
  @IsOptional()
  @IsInt()
  @Min(1)
  cuotasMax?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limiteCuotasMin?: number;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limiteCuotasMax?: number;

  @ApiPropertyOptional({ example: 80000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  limiteMontoTotalMin?: number;

  @ApiPropertyOptional({ example: 2000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  limiteMontoTotalMax?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interesMin?: number;

  @ApiPropertyOptional({ example: 130 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  interesMax?: number;
}
