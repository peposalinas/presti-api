import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';
import { TipoSuscripcion } from '../enums/tipo-suscripcion.enum';

@Entity('cliente_suscripciones')
export class ClienteSuscripcion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TipoSuscripcion })
  tipo: TipoSuscripcion;

  @Column({ name: 'start_timestamp', type: 'timestamp' })
  startTimestamp: Date;

  @Column({ name: 'end_timestamp', type: 'timestamp', nullable: true })
  endTimestamp: Date | null;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.suscripciones)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
