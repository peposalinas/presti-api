import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { TipoProducto } from "../enums/tipo-producto.enum";

export class CreateProductoDto {
  @ApiProperty({ example: "Prestamo personal" })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  activo: boolean;

  @ApiProperty({
    enum: TipoProducto,
    example: TipoProducto.PRESTAMO,
  })
  @IsEnum(TipoProducto)
  tipo: TipoProducto;

  @ApiPropertyOptional({
    example: 20,
    description: "Tasa minima para prestamo o microprestamo",
  })
  @ValidateIf(
    (dto: CreateProductoDto) =>
      dto.tipo === TipoProducto.PRESTAMO ||
      dto.tipo === TipoProducto.MICROPRESTAMO,
  )
  @IsNumber()
  @Min(0)
  tasaMin?: number;

  @ApiPropertyOptional({
    example: 45,
    description: "Tasa maxima para prestamo o microprestamo",
  })
  @ValidateIf(
    (dto: CreateProductoDto) =>
      dto.tipo === TipoProducto.PRESTAMO ||
      dto.tipo === TipoProducto.MICROPRESTAMO,
  )
  @IsNumber()
  @Min(0)
  tasaMax?: number;

  @ApiPropertyOptional({
    example: 100000,
    description: "Monto minimo para prestamo o microprestamo",
  })
  @ValidateIf(
    (dto: CreateProductoDto) =>
      dto.tipo === TipoProducto.PRESTAMO ||
      dto.tipo === TipoProducto.MICROPRESTAMO,
  )
  @IsNumber()
  @Min(0)
  montoMin?: number;

  @ApiPropertyOptional({
    example: 2000000,
    description: "Monto maximo para prestamo o microprestamo",
  })
  @ValidateIf(
    (dto: CreateProductoDto) =>
      dto.tipo === TipoProducto.PRESTAMO ||
      dto.tipo === TipoProducto.MICROPRESTAMO,
  )
  @IsNumber()
  @Min(0)
  montoMax?: number;

  @ApiPropertyOptional({
    example: 3,
    description: "Cuotas minimas para prestamo o microprestamo",
  })
  @ValidateIf(
    (dto: CreateProductoDto) =>
      dto.tipo === TipoProducto.PRESTAMO ||
      dto.tipo === TipoProducto.MICROPRESTAMO,
  )
  @IsInt()
  @Min(1)
  cuotasMin?: number;

  @ApiPropertyOptional({
    example: 48,
    description: "Cuotas maximas para prestamo o microprestamo",
  })
  @ValidateIf(
    (dto: CreateProductoDto) =>
      dto.tipo === TipoProducto.PRESTAMO ||
      dto.tipo === TipoProducto.MICROPRESTAMO,
  )
  @IsInt()
  @Min(1)
  cuotasMax?: number;

  @ApiPropertyOptional({
    example: 1,
    description: "Limite minimo de cuotas para tarjeta de credito",
  })
  @ValidateIf(
    (dto: CreateProductoDto) => dto.tipo === TipoProducto.TARJETA_CREDITO,
  )
  @IsInt()
  @Min(1)
  limiteCuotasMin?: number;

  @ApiPropertyOptional({
    example: 12,
    description: "Limite maximo de cuotas para tarjeta de credito",
  })
  @ValidateIf(
    (dto: CreateProductoDto) => dto.tipo === TipoProducto.TARJETA_CREDITO,
  )
  @IsInt()
  @Min(1)
  limiteCuotasMax?: number;

  @ApiPropertyOptional({
    example: 50000,
    description: "Limite minimo de monto total para tarjeta de credito",
  })
  @ValidateIf(
    (dto: CreateProductoDto) => dto.tipo === TipoProducto.TARJETA_CREDITO,
  )
  @IsNumber()
  @Min(0)
  limiteMontoTotalMin?: number;

  @ApiPropertyOptional({
    example: 1500000,
    description: "Limite maximo de monto total para tarjeta de credito",
  })
  @ValidateIf(
    (dto: CreateProductoDto) => dto.tipo === TipoProducto.TARJETA_CREDITO,
  )
  @IsNumber()
  @Min(0)
  limiteMontoTotalMax?: number;

  @ApiPropertyOptional({
    example: 60,
    description: "Interes minimo para tarjeta de credito",
  })
  @ValidateIf(
    (dto: CreateProductoDto) => dto.tipo === TipoProducto.TARJETA_CREDITO,
  )
  @IsNumber()
  @Min(0)
  interesMin?: number;

  @ApiPropertyOptional({
    example: 140,
    description: "Interes maximo para tarjeta de credito",
  })
  @ValidateIf(
    (dto: CreateProductoDto) => dto.tipo === TipoProducto.TARJETA_CREDITO,
  )
  @IsNumber()
  @Min(0)
  interesMax?: number;
}
