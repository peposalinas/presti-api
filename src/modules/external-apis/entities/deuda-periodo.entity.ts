import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Persona } from './persona.entity';
import { DeudaEntidad } from './deuda-entidad.entity';

@Index(['identificacion', 'periodo'])
@Entity('deuda_periodo')
export class DeudaPeriodo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  identificacion: number;

  @Column({ type: 'varchar', length: 6 })
  periodo: string;

  @Column({ type: 'timestamp' })
  fetched_at: Date;

  @ManyToOne(() => Persona, (p) => p.deudas_periodo)
  @JoinColumn({ name: 'identificacion' })
  persona: Persona;

  @OneToMany(() => DeudaEntidad, (d) => d.deuda_periodo)
  deudas_entidad: DeudaEntidad[];
}
