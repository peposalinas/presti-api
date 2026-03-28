import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';
import { ProductosService } from './productos.service';

@Controller()
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // ── TipoProducto ─────────────────────────────────────────────────────────

  @Get('tipos-producto')
  findAllTipos(@Query('clienteId') clienteId: string) {
    return this.productosService.findAllTipos(clienteId);
  }

  @Get('tipos-producto/:id')
  findOneTipo(@Param('id') id: string, @Query('clienteId') clienteId: string) {
    return this.productosService.findOneTipo(id, clienteId);
  }

  @Post('tipos-producto')
  createTipo(
    @Body() dto: CreateTipoProductoDto,
    @Query('clienteId') clienteId: string,
  ) {
    return this.productosService.createTipo(dto, clienteId);
  }

  @Patch('tipos-producto/:id')
  updateTipo(
    @Param('id') id: string,
    @Body() dto: UpdateTipoProductoDto,
    @Query('clienteId') clienteId: string,
  ) {
    return this.productosService.updateTipo(id, dto, clienteId);
  }

  @Delete('tipos-producto/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTipo(@Param('id') id: string, @Query('clienteId') clienteId: string) {
    return this.productosService.removeTipo(id, clienteId);
  }

  // ── Producto ──────────────────────────────────────────────────────────────

  @Get('productos')
  findAll(@Query('clienteId') clienteId: string) {
    return this.productosService.findAll(clienteId);
  }

  @Get('productos/:id')
  findOne(@Param('id') id: string, @Query('clienteId') clienteId: string) {
    return this.productosService.findOne(id, clienteId);
  }

  @Post('productos')
  create(@Body() dto: CreateProductoDto, @Query('clienteId') clienteId: string) {
    return this.productosService.create(dto, clienteId);
  }

  @Patch('productos/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @Query('clienteId') clienteId: string,
  ) {
    return this.productosService.update(id, dto, clienteId);
  }

  @Delete('productos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Query('clienteId') clienteId: string) {
    return this.productosService.remove(id, clienteId);
  }
}
