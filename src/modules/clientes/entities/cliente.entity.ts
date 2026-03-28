import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Suscripcion } from '../enums/suscripcion.enum';

@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  // Se usa varchar nullable hasta que se definan los valores del enum de suscripción.
  // Al agregar valores a Suscripcion, generar migración para convertir a tipo enum.
  @Column({ type: 'varchar', nullable: true })
  suscripcion: Suscripcion | null;
}
