import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Entidad } from './entidad.entity';
import { Persona } from './persona.entity';

// Foto del último mes: una fila por persona + entidad
@Entity('deudas_actuales')
export class DeudaActual {
  @PrimaryColumn({ type: 'varchar', length: 11 })
  cuil: string;

  @PrimaryColumn({ type: 'int' })
  codigo_entidad: number;

  // Período en formato AAAAMM (ej: "202503")
  @Column({ type: 'varchar', length: 6 })
  periodo: string;

  // Situación crediticia: 1=normal, 2=riesgo bajo, ..., 6=irrecuperable
  @Column({ type: 'int' })
  situacion: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  monto_prestamos: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  garantias_otorgadas: number | null;

  @Column({ type: 'int', nullable: true })
  dias_atraso: number | null;

  @Column({ type: 'boolean', default: false })
  refinanciaciones: boolean;

  @Column({ type: 'boolean', default: false })
  recategorizacion_obligatoria: boolean;

  @Column({ type: 'boolean', default: false })
  situacion_juridica: boolean;

  @ManyToOne(() => Persona, (p) => p.deudas_actuales)
  @JoinColumn({ name: 'cuil' })
  persona: Persona;

  @ManyToOne(() => Entidad, (e) => e.deudas_actuales)
  @JoinColumn({ name: 'codigo_entidad' })
  entidad: Entidad;
}
