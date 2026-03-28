import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Cliente } from './cliente.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryColumn({ type: 'uuid' })
  api_key: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.apiKeys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente;

  @Column({ name: 'cliente_id', type: 'uuid' })
  clienteId: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
