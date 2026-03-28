import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Suscripcion } from '../enums/suscripcion.enum';
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

  // Se usa varchar nullable hasta que se definan los valores del enum de suscripción.
  // Al agregar valores a Suscripcion, generar migración para convertir a tipo enum.
  @Column({ type: 'varchar', nullable: true })
  suscripcion: Suscripcion | null;

  @OneToMany(() => ApiKey, (apiKey) => apiKey.cliente)
  apiKeys: ApiKey[];
}
