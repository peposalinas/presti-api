import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly suscripcionesService: SuscripcionesService,
  ) {}

  findAll(clienteId: string): Promise<Usuario[]> {
    return this.usuarioRepository.find({ where: { clienteId } });
  }

  async findOne(cuil: string, clienteId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { cuil, clienteId },
    });
    if (!usuario) throw new NotFoundException(`Usuario ${cuil} no encontrado`);
    return usuario;
  }

  async create(dto: CreateUsuarioDto, clienteId: string): Promise<Usuario> {
    const count = await this.usuarioRepository.count({ where: { clienteId } });
    await this.suscripcionesService.verificarLimite(clienteId, 'maxUsuarios', count);

    const usuario = this.usuarioRepository.create({ ...dto, clienteId });
    return this.usuarioRepository.save(usuario);
  }

  async update(
    cuil: string,
    dto: UpdateUsuarioDto,
    clienteId: string,
  ): Promise<Usuario> {
    const usuario = await this.findOne(cuil, clienteId);
    Object.assign(usuario, dto);
    return this.usuarioRepository.save(usuario);
  }

  async remove(cuil: string, clienteId: string): Promise<void> {
    const usuario = await this.findOne(cuil, clienteId);
    await this.usuarioRepository.remove(usuario);
  }
}
