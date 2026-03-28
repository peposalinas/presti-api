import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThanOrEqual, MoreThanOrEqual, Or, Repository } from 'typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ModoExceso } from './enums/modo-exceso.enum';
import {
  LimitesSuscripcion,
  LIMITES_SUSCRIPCION,
} from './constants/limites-suscripcion.constants';
import { CreateSuscripcionDto } from './dto/create-suscripcion.dto';
import { DetalleSuscripcionDto } from './dto/detalle-suscripcion.dto';
import { TipoSuscripcion } from './enums/tipo-suscripcion.enum';
import { ClienteSuscripcion } from './entities/cliente-suscripcion.entity';
import { RegistroUso } from './entities/registro-uso.entity';

@Injectable()
export class SuscripcionesService {
  constructor(
    @InjectRepository(ClienteSuscripcion)
    private readonly suscripcionRepository: Repository<ClienteSuscripcion>,
    @InjectRepository(RegistroUso)
    private readonly registroUsoRepository: Repository<RegistroUso>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async asignarSuscripcion(
    clienteId: string,
    dto: CreateSuscripcionDto,
  ): Promise<ClienteSuscripcion> {
    const ahora = new Date();

    const activa = await this.encontrarSuscripcionActiva(clienteId);
    if (activa) {
      activa.endTimestamp = ahora;
      await this.suscripcionRepository.save(activa);
    }

    const suscripcion = this.suscripcionRepository.create({
      tipo: dto.tipo,
      startTimestamp: new Date(dto.startTimestamp),
      endTimestamp: dto.endTimestamp ? new Date(dto.endTimestamp) : null,
      cliente: { id: clienteId },
    });

    return this.suscripcionRepository.save(suscripcion);
  }

  async getSuscripcionActiva(clienteId: string): Promise<ClienteSuscripcion> {
    const suscripcion = await this.encontrarSuscripcionActiva(clienteId);
    if (!suscripcion) {
      throw new NotFoundException(`El cliente no tiene una suscripción activa`);
    }
    return suscripcion;
  }

  async getLimitesCliente(clienteId: string): Promise<LimitesSuscripcion> {
    const suscripcion = await this.getSuscripcionActiva(clienteId);
    return LIMITES_SUSCRIPCION[suscripcion.tipo];
  }

  async verificarLimite(
    clienteId: string,
    campo: keyof LimitesSuscripcion,
    conteoActual: number,
  ): Promise<void> {
    const [limites, cliente] = await Promise.all([
      this.getLimitesCliente(clienteId),
      this.clienteRepository.findOne({ where: { id: clienteId } }),
    ]);

    if (conteoActual < limites[campo]) return;

    if (cliente?.modoExceso === ModoExceso.RECHAZAR) {
      const suscripcion = await this.getSuscripcionActiva(clienteId);
      throw new ForbiddenException(
        `Límite de ${limites[campo]} ${campo} alcanzado para tu suscripción ${suscripcion.tipo}`,
      );
    }
    // ModoExceso.COBRAR: se permite, el exceso se factura aparte
  }

  async verificarYRegistrarConsulta(clienteId: string): Promise<void> {
    const [uso, limites, cliente] = await Promise.all([
      this.getUsoHoy(clienteId),
      this.getLimitesCliente(clienteId),
      this.clienteRepository.findOne({ where: { id: clienteId } }),
    ]);

    if (uso.consultasRecomendaciones >= limites.maxConsultasDiarias) {
      if (cliente?.modoExceso === ModoExceso.RECHAZAR) {
        throw new HttpException(
          `Límite diario de consultas alcanzado (${uso.consultasRecomendaciones}/${limites.maxConsultasDiarias})`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.registrarConsulta(clienteId);
  }

  async registrarConsulta(clienteId: string): Promise<RegistroUso> {
    const hoy = this.fechaHoy();

    let registro = await this.registroUsoRepository.findOne({
      where: { clienteId, fecha: hoy },
    });

    if (!registro) {
      registro = this.registroUsoRepository.create({
        fecha: hoy,
        consultasRecomendaciones: 0,
        cliente: { id: clienteId },
      });
    }

    registro.consultasRecomendaciones += 1;
    return this.registroUsoRepository.save(registro);
  }

  async getUsoHoy(clienteId: string): Promise<RegistroUso> {
    const hoy = this.fechaHoy();
    const registro = await this.registroUsoRepository.findOne({
      where: { clienteId, fecha: hoy },
    });

    if (!registro) {
      return this.registroUsoRepository.create({
        fecha: hoy,
        consultasRecomendaciones: 0,
        clienteId,
      });
    }

    return registro;
  }

  getPlanes(): DetalleSuscripcionDto[] {
    return Object.values(TipoSuscripcion).map((tipo) => ({
      tipo,
      limites: { ...LIMITES_SUSCRIPCION[tipo] },
    }));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private encontrarSuscripcionActiva(
    clienteId: string,
  ): Promise<ClienteSuscripcion | null> {
    const ahora = new Date();
    return this.suscripcionRepository.findOne({
      where: {
        clienteId,
        startTimestamp: LessThanOrEqual(ahora),
        endTimestamp: Or(IsNull(), MoreThanOrEqual(ahora)),
      },
    });
  }

  private fechaHoy(): string {
    return new Date().toISOString().split('T')[0];
  }
}
