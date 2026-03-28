import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { Operador } from '../enums/operador.enum';
import { Parametro } from '../enums/parametro.enum';
import { TipoValor } from '../enums/tipo-valor.enum';

function IsExactlyOneDefined(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isExactlyOneDefined',
      target: (object as any).constructor,
      propertyName,
      options: {
        message: `Exactamente uno de [${fields.join(', ')}] debe estar definido`,
        ...validationOptions,
      },
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;
          const defined = fields.filter(
            (f) => obj[f] !== undefined && obj[f] !== null,
          );
          return defined.length === 1;
        },
      },
    });
  };
}

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

  @IsOptional()
  @IsUUID()
  @IsExactlyOneDefined(['productoId', 'tipoProductoId'])
  productoId?: string;

  @IsOptional()
  @IsUUID()
  tipoProductoId?: string;
}
