import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentCliente } from '../auth/decorators/current-cliente.decorator';
import { UpdatePoliticaCrediticiaDto } from './dto/update-politica-crediticia.dto';
import { PoliticaCrediticiaService } from './politica-crediticia.service';

@ApiBearerAuth()
@ApiTags('Politica Crediticia')
@Controller('politica-crediticia')
export class PoliticaCrediticiaController {
  constructor(
    private readonly politicaCrediticiaService: PoliticaCrediticiaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la política crediticia del cliente' })
  findOne(@CurrentCliente() clienteId: string) {
    return this.politicaCrediticiaService.findByCliente(clienteId);
  }

  @Patch()
  @ApiOperation({
    summary: 'Actualizar la política crediticia del cliente (todos los campos requeridos)',
  })
  update(
    @CurrentCliente() clienteId: string,
    @Body() dto: UpdatePoliticaCrediticiaDto,
  ) {
    return this.politicaCrediticiaService.update(clienteId, dto);
  }
}
