import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('politicas_crediticias')
export class PoliticaCrediticia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'max_situacion_crediticia_permitida',
    type: 'smallint',
    default: 2,
  })
  maxSituacionCrediticiaPermitida: number;

  @Column({ name: 'max_entidades_con_deuda', type: 'integer', default: 3 })
  maxEntidadesConDeuda: number;

  @Column({
    name: 'max_deuda_total_externa',
    type: 'numeric',
    precision: 15,
    scale: 2,
    default: 350000,
  })
  maxDeudaTotalExterna: number;

  @Column({
    name: 'meses_historial_limpio_requerido',
    type: 'integer',
    default: 6,
  })
  mesesHistorialLimpioRequerido: number;

  @OneToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;
}
