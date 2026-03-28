import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Entidad } from './entidad.entity';
import { Persona } from './persona.entity';

// 24 registros mensuales por entidad, provenientes del archivo bianual
@Entity('historial_crediticio')
export class HistorialCrediticio {
  @PrimaryColumn({ type: 'varchar', length: 11 })
  cuil: string;

  @PrimaryColumn({ type: 'int' })
  codigo_entidad: number;

  // Período en formato AAAAMM (ej: "202503")
  @PrimaryColumn({ type: 'varchar', length: 6 })
  periodo: string;

  // Situación crediticia: 1=normal, 2=riesgo bajo, ..., 6=irrecuperable
  @Column({ type: 'int' })
  situacion: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monto: number | null;

  @Column({ type: 'boolean', default: false })
  proceso_judicial: boolean;

  @ManyToOne(() => Persona, (p) => p.historial_crediticio)
  @JoinColumn({ name: 'cuil' })
  persona: Persona;

  @ManyToOne(() => Entidad, (e) => e.historial_crediticio)
  @JoinColumn({ name: 'codigo_entidad' })
  entidad: Entidad;
}
