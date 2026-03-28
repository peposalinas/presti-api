import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('usuarios')
export class Usuario {
  @PrimaryColumn({ type: 'varchar', length: 11 })
  cuil: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'date' })
  fechaNacimiento: Date;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
