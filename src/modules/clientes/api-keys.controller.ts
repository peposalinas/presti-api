import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentCliente } from '../auth/decorators/current-cliente.decorator';
import { ApiKeysService } from './api-keys.service';

@ApiTags('API Keys')
@ApiBearerAuth()
@Controller('clientes/api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva API Key para el cliente autenticado' })
  @ApiResponse({ status: 201, description: 'API Key creada exitosamente' })
  create(@CurrentCliente() clienteId: string) {
    return this.apiKeysService.create(clienteId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las API Keys del cliente autenticado' })
  @ApiResponse({ status: 200, description: 'Lista de API Keys' })
  findAll(@CurrentCliente() clienteId: string) {
    return this.apiKeysService.findAllByCliente(clienteId);
  }

  @Patch(':apiKey/desactivar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desactivar una API Key (acción irreversible)' })
  @ApiResponse({ status: 204, description: 'API Key desactivada' })
  @ApiNotFoundResponse({ description: 'API Key no encontrada' })
  @ApiResponse({ status: 400, description: 'La API Key ya está desactivada' })
  deactivate(
    @Param('apiKey', ParseUUIDPipe) apiKey: string,
    @CurrentCliente() clienteId: string,
  ) {
    return this.apiKeysService.deactivate(apiKey, clienteId);
  }
}
