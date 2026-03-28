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
import { CreateRecomendacionDto } from './dto/create-recomendacion.dto';
import { CreateReglaDto } from './dto/create-regla.dto';
import { UpdateReglaDto } from './dto/update-regla.dto';
import { MotorReglasService } from './motor-reglas.service';

@Controller()
export class MotorReglasController {
  constructor(private readonly motorReglasService: MotorReglasService) {}

  // ── Reglas ────────────────────────────────────────────────────────────────

  @Get('reglas')
  findAllReglas(@Query('clienteId') clienteId: string) {
    return this.motorReglasService.findAllReglas(clienteId);
  }

  @Get('reglas/:id')
  findOneRegla(@Param('id') id: string, @Query('clienteId') clienteId: string) {
    return this.motorReglasService.findOneRegla(id, clienteId);
  }

  @Post('reglas')
  createRegla(
    @Body() dto: CreateReglaDto,
    @Query('clienteId') clienteId: string,
  ) {
    return this.motorReglasService.createRegla(dto, clienteId);
  }

  @Patch('reglas/:id')
  updateRegla(
    @Param('id') id: string,
    @Body() dto: UpdateReglaDto,
    @Query('clienteId') clienteId: string,
  ) {
    return this.motorReglasService.updateRegla(id, dto, clienteId);
  }

  @Delete('reglas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRegla(@Param('id') id: string, @Query('clienteId') clienteId: string) {
    return this.motorReglasService.removeRegla(id, clienteId);
  }

  // ── Recomendaciones ───────────────────────────────────────────────────────

  @Get('recomendaciones')
  findAllRecomendaciones(@Query('clienteId') clienteId: string) {
    return this.motorReglasService.findAllRecomendaciones(clienteId);
  }

  @Get('recomendaciones/:id')
  findOneRecomendacion(
    @Param('id') id: string,
    @Query('clienteId') clienteId: string,
  ) {
    return this.motorReglasService.findOneRecomendacion(id, clienteId);
  }

  @Post('recomendaciones')
  createRecomendacion(
    @Body() dto: CreateRecomendacionDto,
    @Query('clienteId') clienteId: string,
  ) {
    return this.motorReglasService.createRecomendacion(dto, clienteId);
  }
}
