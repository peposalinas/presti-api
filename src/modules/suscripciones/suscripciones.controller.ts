import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCliente } from '../auth/decorators/current-cliente.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { SuscripcionesService } from './suscripciones.service';

@ApiBearerAuth()
@ApiTags('Suscripciones')
@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar los planes de suscripción disponibles con sus límites' })
  getPlanes() {
    return this.suscripcionesService.getPlanes();
  }

  @Post()
  @ApiOperation({ summary: 'Asignar o cambiar la suscripción del cliente' })
  asignarSuscripcion(
    @Body() dto: CreateSuscripcionDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.suscripcionesService.asignarSuscripcion(clienteId, dto);
  }

  @Get('activa')
  @ApiOperation({ summary: 'Consultar la suscripción activa del cliente' })
  getSuscripcionActiva(@CurrentCliente() clienteId: string) {
    return this.suscripcionesService.getSuscripcionActiva(clienteId);
  }

  @Get('uso')
  @ApiOperation({ summary: 'Consultar el uso del día actual' })
  async getUsoHoy(@CurrentCliente() clienteId: string) {
    const [uso, limites] = await Promise.all([
      this.suscripcionesService.getUsoHoy(clienteId),
      this.suscripcionesService.getLimitesCliente(clienteId),
    ]);

    const consultasHoy = uso.consultasRecomendaciones;
    const limiteDiario = limites.maxConsultasDiarias;

    return {
      fecha: uso.fecha,
      consultasHoy,
      consultasRecomendaciones: consultasHoy,
      total: consultasHoy,
      used: consultasHoy,
      remaining: Math.max(limiteDiario - consultasHoy, 0),
      limiteDiario,
    };
  }
}
