import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PoliticaCrediticiaService } from '../politica-crediticia/politica-crediticia.service';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { TipoSuscripcion } from '../suscripciones/enums/tipo-suscripcion.enum';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { Cliente } from './entities/cliente.entity';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    private readonly suscripcionesService: SuscripcionesService,
    private readonly politicaCrediticiaService: PoliticaCrediticiaService,
  ) {}

  findAll(): Promise<Cliente[]> {
    return this.clienteRepository.find();
  }

  async findOne(id: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);
    return cliente;
  }

  findByEmail(email: string): Promise<Cliente | null> {
    return this.clienteRepository.findOne({ where: { email } });
  }

  async create(dto: CreateClienteDto): Promise<Cliente> {
    const cliente = await this.clienteRepository.save(
      this.clienteRepository.create(dto),
    );

    const ahora = new Date();
    await this.suscripcionesService.asignarSuscripcion(cliente.id, {
      tipo: TipoSuscripcion.PROFESSIONAL,
      startTimestamp: ahora.toISOString(),
      endTimestamp: new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await this.politicaCrediticiaService.createDefault(cliente.id);

    return cliente;
  }

  async update(id: string, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);
    Object.assign(cliente, dto);
    return this.clienteRepository.save(cliente);
  }

  async remove(id: string): Promise<void> {
    const cliente = await this.findOne(id);
    await this.clienteRepository.remove(cliente);
  }
}
