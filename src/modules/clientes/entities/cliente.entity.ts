import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClienteSuscripcion } from '../../suscripciones/entities/cliente-suscripcion.entity';
import { ModoExceso } from '../../suscripciones/enums/modo-exceso.enum';
import { ApiKey } from './api-key.entity';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ name: 'modo_exceso', type: 'enum', enum: ModoExceso, default: ModoExceso.RECHAZAR })
  modoExceso: ModoExceso;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.cliente)
  apiKeys: ApiKey[];

  @OneToMany(() => ClienteSuscripcion, (s) => s.cliente)
  suscripciones: ClienteSuscripcion[];
}
