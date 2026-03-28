import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Persona } from './persona.entity';

@Index(['identificacion', 'fecha_rechazo'])
@Entity('cheque_rechazado')
export class ChequeRechazado {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  identificacion: number;

  @Column({ type: 'varchar', length: 100 })
  causal: string;

  @Column({ type: 'int' })
  entidad: number;

  @Column({ type: 'int' })
  nro_cheque: number;

  @Column({ type: 'date' })
  fecha_rechazo: Date;

  @Column({ type: 'numeric', precision: 15, scale: 2 })
  monto: number;

  @Column({ type: 'date', nullable: true })
  fecha_pago: Date | null;

  @Column({ type: 'date', nullable: true })
  fecha_pago_multa: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estado_multa: string | null;

  @Column({ type: 'boolean', default: false })
  cta_personal: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  denom_juridica: string | null;

  @Column({ type: 'boolean', default: false })
  en_revision: boolean;

  @Column({ type: 'boolean', default: false })
  proceso_jud: boolean;

  @Column({ type: 'timestamp' })
  fetched_at: Date;

  @ManyToOne(() => Persona, (p) => p.cheques_rechazados)
  @JoinColumn({ name: 'identificacion' })
  persona: Persona;
}
