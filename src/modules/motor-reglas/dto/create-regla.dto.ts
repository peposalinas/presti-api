import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, IsUUID, Min } from 'class-validator';
import { Operador } from '../enums/operador.enum';
import { Parametro } from '../enums/parametro.enum';
import { TipoValor } from '../enums/tipo-valor.enum';

export class CreateReglaDto {
  @ApiProperty({
    enum: Parametro,
    example: Parametro.EDAD,
    description: 'Parámetro del solicitante a evaluar.',
  })
  @IsEnum(Parametro)
  parametro: Parametro;

  @ApiProperty({
    enum: Operador,
    example: Operador.MAYOR_O_IGUAL,
    description: 'Operador de comparación entre el parámetro y el valor umbral.',
  })
  @IsEnum(Operador)
  operador: Operador;

  @ApiProperty({
    example: '18',
    description: 'Valor umbral con el que se compara el parámetro. Siempre se envía como string.',
  })
  @IsString()
  valor: string;

  @ApiProperty({
    enum: TipoValor,
    example: TipoValor.NUMERO,
    description: 'Tipo del valor para la conversión al evaluar la regla.',
  })
  @IsEnum(TipoValor)
  tipoValor: TipoValor;

  @ApiProperty({
    example: 1,
    minimum: 1,
    description: 'Prioridad de evaluación. Las reglas con menor número se evalúan primero.',
  })
  @IsInt()
  @Min(1)
  prioridad: number;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del producto al que aplica esta regla.',
  })
  @IsUUID()
  productoId: string;
}
