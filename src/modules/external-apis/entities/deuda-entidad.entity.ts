import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DeudaPeriodo } from './deuda-periodo.entity';

@Entity('deuda_entidad')
export class DeudaEntidad {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  deuda_periodo_id: number;

  @Column({ type: 'varchar', length: 255 })
  entidad: string;

  @Column({ type: 'smallint' })
  situacion: number;

  @Column({ type: 'date', nullable: true })
  fecha_sit1: Date | null;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  monto: number;

  @Column({ type: 'int', nullable: true })
  dias_atraso_pago: number | null;

  @Column({ type: 'boolean', default: false })
  refinanciaciones: boolean;

  @Column({ type: 'boolean', default: false })
  recategorizacion_oblig: boolean;

  @Column({ type: 'boolean', default: false })
  situacion_juridica: boolean;

  @Column({ type: 'boolean', default: false })
  irrec_disposicion_tecnica: boolean;

  @Column({ type: 'boolean', default: false })
  en_revision: boolean;

  @Column({ type: 'boolean', default: false })
  proceso_jud: boolean;

  @ManyToOne(() => DeudaPeriodo, (p) => p.deudas_entidad)
  @JoinColumn({ name: 'deuda_periodo_id' })
  deuda_periodo: DeudaPeriodo;
}
