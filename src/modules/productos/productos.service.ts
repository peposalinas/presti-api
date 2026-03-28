import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SuscripcionesService } from "../suscripciones/suscripciones.service";
import { CreateProductoDto } from "./dto/create-producto.dto";
import { UpdateProductoDto } from "./dto/update-producto.dto";
import { TipoProducto } from "./enums/tipo-producto.enum";
import { Producto } from "./entities/producto.entity";

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly suscripcionesService: SuscripcionesService,
  ) {}

  findAll(clienteId: string): Promise<Producto[]> {
    return this.productoRepository.find({ where: { clienteId } });
  }

  async findOne(id: string, clienteId: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id, clienteId },
    });
    if (!producto) throw new NotFoundException(`Producto ${id} no encontrado`);
    return producto;
  }

  async create(dto: CreateProductoDto, clienteId: string): Promise<Producto> {
    const count = await this.productoRepository.count({ where: { clienteId } });
    await this.suscripcionesService.verificarLimite(
      clienteId,
      "maxProductos",
      count,
    );

    await this.validarTipoDuplicado(clienteId, dto.tipo);

    const producto = this.productoRepository.create({ ...dto, clienteId });
    this.limpiarCamposNoAplicables(producto);
    this.validarConfiguracion(producto);

    return this.productoRepository.save(producto);
  }

  async update(
    id: string,
    dto: UpdateProductoDto,
    clienteId: string,
  ): Promise<Producto> {
    const producto = await this.findOne(id, clienteId);

    const tipoObjetivo = dto.tipo ?? producto.tipo;
    if (tipoObjetivo !== producto.tipo) {
      await this.validarTipoDuplicado(clienteId, tipoObjetivo, producto.id);
    }

    Object.assign(producto, dto);
    producto.tipo = tipoObjetivo;

    this.limpiarCamposNoAplicables(producto);
    this.validarConfiguracion(producto);

    return this.productoRepository.save(producto);
  }

  async remove(id: string, clienteId: string): Promise<void> {
    const producto = await this.findOne(id, clienteId);
    await this.productoRepository.remove(producto);
  }

  private async validarTipoDuplicado(
    clienteId: string,
    tipo: TipoProducto,
    productoIdActual?: string,
  ): Promise<void> {
    const existente = await this.productoRepository.findOne({
      where: { clienteId, tipo },
    });

    if (existente && existente.id !== productoIdActual) {
      throw new ConflictException(
        `Ya existe un producto de tipo ${tipo} para este cliente`,
      );
    }
  }

  private limpiarCamposNoAplicables(producto: Producto): void {
    if (
      producto.tipo === TipoProducto.PRESTAMO ||
      producto.tipo === TipoProducto.MICROPRESTAMO
    ) {
      producto.limiteCuotasMin = null;
      producto.limiteCuotasMax = null;
      producto.limiteMontoTotalMin = null;
      producto.limiteMontoTotalMax = null;
      producto.interesMin = null;
      producto.interesMax = null;
      return;
    }

    producto.tasaMin = null;
    producto.tasaMax = null;
    producto.montoMin = null;
    producto.montoMax = null;
    producto.cuotasMin = null;
    producto.cuotasMax = null;
  }

  private validarConfiguracion(producto: Producto): void {
    if (
      producto.tipo === TipoProducto.PRESTAMO ||
      producto.tipo === TipoProducto.MICROPRESTAMO
    ) {
      this.validarRangoNumerico("tasa", producto.tasaMin, producto.tasaMax);
      this.validarRangoNumerico("monto", producto.montoMin, producto.montoMax);
      this.validarRangoEntero("cuotas", producto.cuotasMin, producto.cuotasMax);
      return;
    }

    this.validarRangoEntero(
      "limite de cuotas",
      producto.limiteCuotasMin,
      producto.limiteCuotasMax,
    );
    this.validarRangoNumerico(
      "limite de monto total",
      producto.limiteMontoTotalMin,
      producto.limiteMontoTotalMax,
    );
    this.validarRangoNumerico(
      "interes",
      producto.interesMin,
      producto.interesMax,
    );
  }

  private validarRangoNumerico(
    campo: string,
    min: number | null,
    max: number | null,
  ): void {
    if (
      min === null ||
      max === null ||
      min === undefined ||
      max === undefined
    ) {
      throw new BadRequestException(`Debes indicar ${campo} minimo y maximo`);
    }

    if (min < 0 || max < 0) {
      throw new BadRequestException(
        `Los valores de ${campo} deben ser mayores o iguales a 0`,
      );
    }

    if (min > max) {
      throw new BadRequestException(
        `${campo} minimo no puede ser mayor que ${campo} maximo`,
      );
    }
  }

  private validarRangoEntero(
    campo: string,
    min: number | null,
    max: number | null,
  ): void {
    if (
      min === null ||
      max === null ||
      min === undefined ||
      max === undefined
    ) {
      throw new BadRequestException(`Debes indicar ${campo} minimo y maximo`);
    }

    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max) ||
      min < 1 ||
      max < 1
    ) {
      throw new BadRequestException(
        `Los valores de ${campo} deben ser enteros mayores o iguales a 1`,
      );
    }

    if (min > max) {
      throw new BadRequestException(
        `${campo} minimo no puede ser mayor que ${campo} maximo`,
      );
    }
  }
}
