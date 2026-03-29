import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentCliente } from '../auth/decorators/current-cliente.decorator';
import { CarteraService } from './cartera.service';

@ApiBearerAuth()
@ApiTags('Cartera')
@Controller('portfolio')
export class CarteraController {
  constructor(private readonly carteraService: CarteraService) {}

  @Get()
  @ApiOperation({
    summary: 'Cambios de situación crediticia detectados en la cartera',
  })
  @ApiQuery({
    name: 'meses',
    required: false,
    description: 'Meses hacia atrás a consultar. Default: 1.',
  })
  getPortfolio(
    @CurrentCliente() clienteId: string,
    @Query('meses') meses = '1',
  ) {
    return this.carteraService.getPortfolio(clienteId, parseInt(meses, 10));
  }
}
