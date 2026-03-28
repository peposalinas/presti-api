import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { DeudaActual } from './deuda-actual.entity';
import { HistorialCrediticio } from './historial-crediticio.entity';

@Entity('personas')
export class Persona {
  // CUIL de 11 dígitos almacenado como string para preservar ceros iniciales
  @PrimaryColumn({ type: 'varchar', length: 11 })
  cuil: string;

  @Column({ type: 'varchar', length: 1, nullable: true })
  sexo_inferido: string | null;

  @Column({ type: 'int', nullable: true })
  edad_estimada: number | null;

  // Fecha del archivo 1DSF que originó la situación crediticia inicial
  @Column({ type: 'date', nullable: true })
  fecha_origen_situacion_1: Date | null;

  // Mejor situación crediticia observada (1=normal, 6=irrecuperable)
  @Column({ type: 'int', nullable: true })
  mejor_situacion: number | null;

  // Peor situación crediticia observada
  @Column({ type: 'int', nullable: true })
  peor_situacion: number | null;

  @OneToMany(() => DeudaActual, (d) => d.persona)
  deudas_actuales: DeudaActual[];

  @OneToMany(() => HistorialCrediticio, (h) => h.persona)
  historial_crediticio: HistorialCrediticio[];
}
