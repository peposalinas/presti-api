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
import { CreateRecomendacionDto } from './dto/create-recomendacion.dto';
import { CreateReglaDto } from './dto/create-regla.dto';
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
  @ApiOperation({ summary: 'Crear una regla' })
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
  @ApiOperation({ summary: 'Listar recomendaciones' })
  findAllRecomendaciones(@CurrentCliente() clienteId: string) {
    return this.motorReglasService.findAllRecomendaciones(clienteId);
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
  @Post('recomendaciones')
  @ApiOperation({ summary: 'Crear una recomendación' })
  createRecomendacion(
    @Body() dto: CreateRecomendacionDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.createRecomendacion(dto, clienteId);
  }
}
