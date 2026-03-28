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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCliente } from '../auth/decorators/current-cliente.decorator';
import { CreateProductoDto } from './dto/create-producto.dto';
import { CreateTipoProductoDto } from './dto/create-tipo-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { UpdateTipoProductoDto } from './dto/update-tipo-producto.dto';
import { ProductosService } from './productos.service';

@ApiBearerAuth()
@ApiTags('Productos')
@Controller()
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // ── TipoProducto ─────────────────────────────────────────────────────────

  @Get('tipos-producto')
  @ApiOperation({ summary: 'Listar tipos de producto' })
  findAllTipos(@CurrentCliente() clienteId: string) {
    return this.productosService.findAllTipos(clienteId);
  }

  @Get('tipos-producto/:id')
  @ApiOperation({ summary: 'Obtener un tipo de producto' })
  findOneTipo(@Param('id') id: string, @CurrentCliente() clienteId: string) {
    return this.productosService.findOneTipo(id, clienteId);
  }

  @Post('tipos-producto')
  @ApiOperation({ summary: 'Crear un tipo de producto' })
  createTipo(
    @Body() dto: CreateTipoProductoDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.productosService.createTipo(dto, clienteId);
  }

  @Patch('tipos-producto/:id')
  @ApiOperation({ summary: 'Actualizar un tipo de producto' })
  updateTipo(
    @Param('id') id: string,
    @Body() dto: UpdateTipoProductoDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.productosService.updateTipo(id, dto, clienteId);
  }

  @Delete('tipos-producto/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de producto' })
  removeTipo(@Param('id') id: string, @CurrentCliente() clienteId: string) {
    return this.productosService.removeTipo(id, clienteId);
  }

  // ── Producto ──────────────────────────────────────────────────────────────

  @Get('productos')
  @ApiOperation({ summary: 'Listar productos' })
  findAll(@CurrentCliente() clienteId: string) {
    return this.productosService.findAll(clienteId);
  }

  @Get('productos/:id')
  @ApiOperation({ summary: 'Obtener un producto' })
  findOne(@Param('id') id: string, @CurrentCliente() clienteId: string) {
    return this.productosService.findOne(id, clienteId);
  }

  @Post('productos')
  @ApiOperation({ summary: 'Crear un producto' })
  create(@Body() dto: CreateProductoDto, @CurrentCliente() clienteId: string) {
    return this.productosService.create(dto, clienteId);
  }

  @Patch('productos/:id')
  @ApiOperation({ summary: 'Actualizar un producto' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductoDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.productosService.update(id, dto, clienteId);
  }

  @Delete('productos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto' })
  remove(@Param('id') id: string, @CurrentCliente() clienteId: string) {
    return this.productosService.remove(id, clienteId);
  }
}
