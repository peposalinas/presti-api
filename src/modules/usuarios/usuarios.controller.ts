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
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuariosService } from './usuarios.service';

// clienteId se obtiene por query param hasta que se implemente auth por JWT
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  findAll(@Query('clienteId') clienteId: string) {
    return this.usuariosService.findAll(clienteId);
  }

  @Get(':cuil')
  findOne(@Param('cuil') cuil: string, @Query('clienteId') clienteId: string) {
    return this.usuariosService.findOne(cuil, clienteId);
  }

  @Post()
  create(@Body() dto: CreateUsuarioDto, @Query('clienteId') clienteId: string) {
    return this.usuariosService.create(dto, clienteId);
  }

  @Patch(':cuil')
  update(
    @Param('cuil') cuil: string,
    @Body() dto: UpdateUsuarioDto,
    @Query('clienteId') clienteId: string,
  ) {
    return this.usuariosService.update(cuil, dto, clienteId);
  }

  @Delete(':cuil')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('cuil') cuil: string, @Query('clienteId') clienteId: string) {
    return this.usuariosService.remove(cuil, clienteId);
  }
}
