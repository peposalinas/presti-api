import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { TipoProducto } from './tipo-producto.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'boolean' })
  activo: boolean;

  @Column({ name: 'tipo_producto_id' })
  tipoProductoId: string;

  @ManyToOne(() => TipoProducto)
  @JoinColumn({ name: 'tipo_producto_id' })
  tipoProducto: TipoProducto;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
