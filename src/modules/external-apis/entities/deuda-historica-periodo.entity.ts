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
import { DeudaHistoricaEntidad } from './deuda-historica-entidad.entity';

@Index(['identificacion', 'periodo'])
@Entity('deuda_historica_periodo')
export class DeudaHistoricaPeriodo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'bigint' })
  identificacion: number;

  @Column({ type: 'varchar', length: 6 })
  periodo: string;

  @Column({ type: 'timestamp' })
  fetched_at: Date;

  @ManyToOne(() => Persona, (p) => p.deudas_historicas_periodo)
  @JoinColumn({ name: 'identificacion' })
  persona: Persona;

  @OneToMany(() => DeudaHistoricaEntidad, (d) => d.deuda_historica_periodo)
  deudas_historica_entidad: DeudaHistoricaEntidad[];
}
