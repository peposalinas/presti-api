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
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios del cliente autenticado' })
  findAll(@CurrentCliente() clienteId: string) {
    return this.usuariosService.findAll(clienteId);
  }

  @Get(':cuil')
  @ApiOperation({ summary: 'Obtener un usuario por CUIL' })
  findOne(@Param('cuil') cuil: string, @CurrentCliente() clienteId: string) {
    return this.usuariosService.findOne(cuil, clienteId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  create(@Body() dto: CreateUsuarioDto, @CurrentCliente() clienteId: string) {
    return this.usuariosService.create(dto, clienteId);
  }

  @Patch(':cuil')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  update(
    @Param('cuil') cuil: string,
    @Body() dto: UpdateUsuarioDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.usuariosService.update(cuil, dto, clienteId);
  }

  @Delete(':cuil')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un usuario' })
  remove(@Param('cuil') cuil: string, @CurrentCliente() clienteId: string) {
    return this.usuariosService.remove(cuil, clienteId);
  }
}
