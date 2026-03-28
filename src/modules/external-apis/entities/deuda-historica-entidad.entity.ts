import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeudaHistoricaPeriodo } from './deuda-historica-periodo.entity';

@Entity('deuda_historica_entidad')
export class DeudaHistoricaEntidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  deuda_hist_periodo_id: number;

  @Column({ type: 'varchar', length: 255 })
  entidad: string;

  @Column({ type: 'smallint' })
  situacion: number;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  monto: number;

  @Column({ type: 'boolean', default: false })
  en_revision: boolean;

  @Column({ type: 'boolean', default: false })
  proceso_jud: boolean;

  @ManyToOne(() => DeudaHistoricaPeriodo, (p) => p.deudas_historica_entidad)
  @JoinColumn({ name: 'deuda_hist_periodo_id' })
  deuda_historica_periodo: DeudaHistoricaPeriodo;
}
