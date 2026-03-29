import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity';

@Entity('consultas_usuario')
@Unique(['cliente', 'cuil'])
export class ConsultaUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ type: 'varchar', length: 11 })
  cuil: string;

  @Column({ type: 'smallint', nullable: true })
  situacion: number | null;

  @UpdateDateColumn({ name: 'ultima_consulta_at' })
  ultimaConsultaAt: Date;
}
