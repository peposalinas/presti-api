import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('cambios_situacion')
export class CambioSituacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'varchar', length: 11 })
  cuil: string;

  @Column({ name: 'situacion_anterior', type: 'smallint' })
  situacionAnterior: number;

  @Column({ name: 'situacion_nueva', type: 'smallint' })
  situacionNueva: number;

  @Column({ name: 'detectado_at', type: 'timestamp' })
  detectadoAt: Date;
}
