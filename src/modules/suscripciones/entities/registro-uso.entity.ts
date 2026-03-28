import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Unique(['clienteId', 'fecha'])
@Entity('registros_uso')
export class RegistroUso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ name: 'consultas_recomendaciones', type: 'integer', default: 0 })
  consultasRecomendaciones: number;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
