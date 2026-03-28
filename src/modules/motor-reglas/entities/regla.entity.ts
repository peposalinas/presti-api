import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { Producto } from '../../productos/entities/producto.entity';
import { TipoProducto } from '../../productos/entities/tipo-producto.entity';
import { Operador } from '../enums/operador.enum';
import { Parametro } from '../enums/parametro.enum';
import { TipoValor } from '../enums/tipo-valor.enum';

@Check(`("producto_id" IS NOT NULL AND "tipo_producto_id" IS NULL)
     OR ("producto_id" IS NULL AND "tipo_producto_id" IS NOT NULL)`)
@Entity('reglas')
export class Regla {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Parametro })
  parametro: Parametro;

  @Column({ type: 'enum', enum: Operador })
  operador: Operador;

  @Column({ type: 'text' })
  valor: string;

  @Column({ type: 'enum', enum: TipoValor, name: 'tipo_valor' })
  tipoValor: TipoValor;

  @Column({ type: 'integer' })
  prioridad: number;

  @Column({ name: 'producto_id', nullable: true })
  productoId: string | null;

  @ManyToOne(() => Producto, { nullable: true })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto | null;

  @Column({ name: 'tipo_producto_id', nullable: true })
  tipoProductoId: string | null;

  @ManyToOne(() => TipoProducto, { nullable: true })
  @JoinColumn({ name: 'tipo_producto_id' })
  tipoProducto: TipoProducto | null;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
