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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CurrentCliente } from '../auth/decorators/current-cliente.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtOrApiKeyAuthGuard } from '../auth/guards/jwt-or-api-key-auth.guard';
import { CreateRecomendacionDto } from './dto/create-recomendacion.dto';
import { CreateReglaDto } from './dto/create-regla.dto';
import { UpdateRecomendacionDto } from './dto/update-recomendacion.dto';
import { UpdateReglaDto } from './dto/update-regla.dto';
import { MotorReglasService } from './motor-reglas.service';

@ApiBearerAuth()
@Controller()
export class MotorReglasController {
  constructor(private readonly motorReglasService: MotorReglasService) {}

  // ── Reglas ────────────────────────────────────────────────────────────────

  @ApiTags('Reglas')
  @Get('reglas')
  @ApiOperation({ summary: 'Listar reglas ordenadas por prioridad' })
  findAllReglas(@CurrentCliente() clienteId: string) {
    return this.motorReglasService.findAllReglas(clienteId);
  }

  @ApiTags('Reglas')
  @Get('reglas/:id')
  @ApiOperation({ summary: 'Obtener una regla' })
  findOneRegla(@Param('id') id: string, @CurrentCliente() clienteId: string) {
    return this.motorReglasService.findOneRegla(id, clienteId);
  }

  @ApiTags('Reglas')
  @Post('reglas')
  @ApiOperation({ summary: 'Crear una regla (a nivel producto o tipo de producto)' })
  createRegla(
    @Body() dto: CreateReglaDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.createRegla(dto, clienteId);
  }

  @ApiTags('Reglas')
  @Patch('reglas/:id')
  @ApiOperation({ summary: 'Actualizar una regla' })
  updateRegla(
    @Param('id') id: string,
    @Body() dto: UpdateReglaDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.updateRegla(id, dto, clienteId);
  }

  @ApiTags('Reglas')
  @Delete('reglas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una regla' })
  removeRegla(@Param('id') id: string, @CurrentCliente() clienteId: string) {
    return this.motorReglasService.removeRegla(id, clienteId);
  }

  // ── Recomendaciones ───────────────────────────────────────────────────────

  @ApiTags('Recomendaciones')
  @Get('recomendaciones')
  @ApiOperation({ summary: 'Listar recomendaciones con filtros opcionales' })
  @ApiQuery({ name: 'usuarioCuil', required: false })
  @ApiQuery({ name: 'productoId', required: false })
  @ApiQuery({ name: 'tipoProductoId', required: false })
  findAllRecomendaciones(
    @CurrentCliente() clienteId: string,
    @Query('usuarioCuil') usuarioCuil?: string,
    @Query('productoId') productoId?: string,
    @Query('tipoProductoId') tipoProductoId?: string,
  ) {
    return this.motorReglasService.findAllRecomendaciones(clienteId, {
      usuarioCuil,
      productoId,
      tipoProductoId,
    });
  }

  @ApiTags('Recomendaciones')
  @Get('recomendaciones/:id')
  @ApiOperation({ summary: 'Obtener una recomendación' })
  findOneRecomendacion(
    @Param('id') id: string,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.findOneRecomendacion(id, clienteId);
  }

  @ApiTags('Recomendaciones')
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Post('recomendaciones')
  @ApiBearerAuth()
  @ApiSecurity('x-api-key')
  @ApiOperation({
    summary: 'Evaluar reglas para un usuario y generar recomendaciones de productos (JWT o API Key)',
  })
  createRecomendacion(
    @Body() dto: CreateRecomendacionDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.createRecomendacion(dto, clienteId);
  }

  @ApiTags('Recomendaciones')
  @Patch('recomendaciones/:id')
  @ApiOperation({ summary: 'Registrar si una recomendación tuvo éxito' })
  updateRecomendacion(
    @Param('id') id: string,
    @Body() dto: UpdateRecomendacionDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.updateRecomendacion(id, dto, clienteId);
  }
}
