import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cliente } from "../../clientes/entities/cliente.entity";
import { Producto } from "../../productos/entities/producto.entity";
import { Operador } from "../enums/operador.enum";
import { Parametro } from "../enums/parametro.enum";
import { TipoValor } from "../enums/tipo-valor.enum";

@Entity("reglas")
export class Regla {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: Parametro })
  parametro: Parametro;

  @Column({ type: "enum", enum: Operador })
  operador: Operador;

  @Column({ type: "text" })
  valor: string;

  @Column({ type: "enum", enum: TipoValor, name: "tipo_valor" })
  tipoValor: TipoValor;

  @Column({ type: "integer" })
  prioridad: number;

  @Column({ name: "producto_id" })
  productoId: string;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: "producto_id" })
  producto: Producto;

  @Column({ name: "cliente_id" })
  clienteId: string;

  @ManyToOne(() => Cliente)
  @JoinColumn({ name: "cliente_id" })
  cliente: Cliente;
}
