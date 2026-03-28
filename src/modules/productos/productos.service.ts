import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';
import { Producto } from './entities/producto.entity';
import { TipoProducto } from './entities/tipo-producto.entity';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(TipoProducto)
    private readonly tipoProductoRepository: Repository<TipoProducto>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    private readonly suscripcionesService: SuscripcionesService,
  ) {}

  // ── TipoProducto ─────────────────────────────────────────────────────────

  findAllTipos(clienteId: string): Promise<TipoProducto[]> {
    return this.tipoProductoRepository.find({ where: { clienteId } });
  }

  async findOneTipo(id: string, clienteId: string): Promise<TipoProducto> {
    const tipo = await this.tipoProductoRepository.findOne({
      where: { id, clienteId },
    });
    if (!tipo) throw new NotFoundException(`TipoProducto ${id} no encontrado`);
    return tipo;
  }

  async createTipo(dto: CreateTipoProductoDto, clienteId: string): Promise<TipoProducto> {
    const count = await this.tipoProductoRepository.count({ where: { clienteId } });
    await this.suscripcionesService.verificarLimite(clienteId, 'maxTiposProducto', count);

    const tipo = this.tipoProductoRepository.create({ ...dto, clienteId });
    return this.tipoProductoRepository.save(tipo);
  }

  async updateTipo(
    id: string,
    dto: UpdateTipoProductoDto,
    clienteId: string,
  ): Promise<TipoProducto> {
    const tipo = await this.findOneTipo(id, clienteId);
    Object.assign(tipo, dto);
    return this.tipoProductoRepository.save(tipo);
  }

  async removeTipo(id: string, clienteId: string): Promise<void> {
    const tipo = await this.findOneTipo(id, clienteId);
    await this.tipoProductoRepository.remove(tipo);
  }

  // ── Producto ──────────────────────────────────────────────────────────────

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
    await this.suscripcionesService.verificarLimite(clienteId, 'maxProductos', count);

    const producto = this.productoRepository.create({ ...dto, clienteId });
    return this.productoRepository.save(producto);
  }

  async update(
    id: string,
    dto: UpdateProductoDto,
    clienteId: string,
  ): Promise<Producto> {
    const producto = await this.findOne(id, clienteId);
    Object.assign(producto, dto);
    return this.productoRepository.save(producto);
  }

  async remove(id: string, clienteId: string): Promise<void> {
    const producto = await this.findOne(id, clienteId);
    await this.productoRepository.remove(producto);
  }
}
