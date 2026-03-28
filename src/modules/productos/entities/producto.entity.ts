import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Cliente } from "../../clientes/entities/cliente.entity";
import { TipoProducto } from "../enums/tipo-producto.enum";

@Entity("productos")
@Unique("UQ_productos_cliente_tipo", ["clienteId", "tipo"])
export class Producto {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  nombre: string;

  @Column({ type: "boolean" })
  activo: boolean;

  @Column({ type: "enum", enum: TipoProducto, enumName: "productos_tipo_enum" })
  tipo: TipoProducto;

  @Column({ name: "tasa_min", type: "double precision", nullable: true })
  tasaMin: number | null;

  @Column({ name: "tasa_max", type: "double precision", nullable: true })
  tasaMax: number | null;

  @Column({ name: "monto_min", type: "double precision", nullable: true })
  montoMin: number | null;

  @Column({ name: "monto_max", type: "double precision", nullable: true })
  montoMax: number | null;

  @Column({ name: "cuotas_min", type: "integer", nullable: true })
  cuotasMin: number | null;

  @Column({ name: "cuotas_max", type: "integer", nullable: true })
  cuotasMax: number | null;

  @Column({ name: "limite_cuotas_min", type: "integer", nullable: true })
  limiteCuotasMin: number | null;

  @Column({ name: "limite_cuotas_max", type: "integer", nullable: true })
  limiteCuotasMax: number | null;

  @Column({
    name: "limite_monto_total_min",
    type: "double precision",
    nullable: true,
  })
  limiteMontoTotalMin: number | null;

  @Column({
    name: "limite_monto_total_max",
    type: "double precision",
    nullable: true,
  })
  limiteMontoTotalMax: number | null;

  @Column({ name: "interes_min", type: "double precision", nullable: true })
  interesMin: number | null;

  @Column({ name: "interes_max", type: "double precision", nullable: true })
  interesMax: number | null;

  @Column({ name: "cliente_id" })
  clienteId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: "cliente_id" })
  cliente: Cliente;
}
