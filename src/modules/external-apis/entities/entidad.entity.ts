import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { TipoEntidad } from './enums/tipo-entidad.enum';
import { DeudaActual } from './deuda-actual.entity';
import { HistorialCrediticio } from './historial-crediticio.entity';

@Entity('entidades')
export class Entidad {
  @PrimaryColumn({ type: 'int' })
  codigo_entidad: number;

  @Column({ type: 'varchar', length: 255 })
  nombre_entidad: string;

  @Column({
    type: 'enum',
    enum: TipoEntidad,
    nullable: true,
  })
  tipo_entidad: TipoEntidad | null;

  @OneToMany(() => DeudaActual, (d) => d.entidad)
  deudas_actuales: DeudaActual[];

  @OneToMany(() => HistorialCrediticio, (h) => h.entidad)
  historial_crediticio: HistorialCrediticio[];
}
