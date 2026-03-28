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
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CurrentCliente } from "../auth/decorators/current-cliente.decorator";
import { CreateProductoDto } from "./dto/create-producto.dto";
import { UpdateProductoDto } from "./dto/update-producto.dto";
import { ProductosService } from "./productos.service";

@ApiBearerAuth()
@ApiTags("Productos")
@Controller()
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get("productos")
  @ApiOperation({ summary: "Listar productos" })
  findAll(@CurrentCliente() clienteId: string) {
    return this.productosService.findAll(clienteId);
  }

  @Get("productos/:id")
  @ApiOperation({ summary: "Obtener un producto" })
  findOne(@Param("id") id: string, @CurrentCliente() clienteId: string) {
    return this.productosService.findOne(id, clienteId);
  }

  @Post("productos")
  @ApiOperation({ summary: "Crear un producto" })
  create(@Body() dto: CreateProductoDto, @CurrentCliente() clienteId: string) {
    return this.productosService.create(dto, clienteId);
  }

  @Patch("productos/:id")
  @ApiOperation({ summary: "Actualizar un producto" })
  update(
    @Param("id") id: string,
    @Body() dto: UpdateProductoDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.productosService.update(id, dto, clienteId);
  }

  @Delete("productos/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar un producto" })
  remove(@Param("id") id: string, @CurrentCliente() clienteId: string) {
    return this.productosService.remove(id, clienteId);
  }
}
