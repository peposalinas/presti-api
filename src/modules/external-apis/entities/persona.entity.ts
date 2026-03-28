import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeudaPeriodo } from './deuda-periodo.entity';
import { DeudaHistoricaPeriodo } from './deuda-historica-periodo.entity';
import { ChequeRechazado } from './cheque-rechazado.entity';

@Entity('persona')
export class Persona {
  @PrimaryColumn({ type: 'bigint' })
  identificacion: number;

  @Column({ type: 'varchar', length: 255 })
  denominacion: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => DeudaPeriodo, (d) => d.persona)
  deudas_periodo: DeudaPeriodo[];

  @OneToMany(() => DeudaHistoricaPeriodo, (d) => d.persona)
  deudas_historicas_periodo: DeudaHistoricaPeriodo[];

  @OneToMany(() => ChequeRechazado, (c) => c.persona)
  cheques_rechazados: ChequeRechazado[];
}
