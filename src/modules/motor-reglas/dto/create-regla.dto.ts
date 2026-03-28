import { IsEnum, IsInt, IsString, IsUUID, Min } from "class-validator";
import { Operador } from "../enums/operador.enum";
import { Parametro } from "../enums/parametro.enum";
import { TipoValor } from "../enums/tipo-valor.enum";

export class CreateReglaDto {
  @IsEnum(Parametro)
  parametro: Parametro;

  @IsEnum(Operador)
  operador: Operador;

  @IsString()
  valor: string;

  @IsEnum(TipoValor)
  tipoValor: TipoValor;

  @IsInt()
  @Min(1)
  prioridad: number;

  @IsUUID()
  productoId: string;
}
