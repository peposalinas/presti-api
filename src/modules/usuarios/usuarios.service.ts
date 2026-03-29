import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BcraService } from "../external-apis/bcra/bcra.service";
import { BcraPeriodoDto } from "../external-apis/bcra/dto/bcra-deudor.dto";
import { DeudaEntidad } from "../external-apis/entities/deuda-entidad.entity";
import { DeudaPeriodo } from "../external-apis/entities/deuda-periodo.entity";
import { Persona } from "../external-apis/entities/persona.entity";
import { SuscripcionesService } from "../suscripciones/suscripciones.service";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { Usuario } from "./entities/usuario.entity";

type CambioSituacion =
  | "SUBIO"
  | "BAJO"
  | "SIN_CAMBIO"
  | "SIN_HISTORICO"
  | "SIN_DATOS_BCRA"
  | "ERROR";

type ResultadoRefreshUsuario = {
  cuil: string;
  nombre: string;
  situacionAnterior: number | null;
  situacionNueva: number | null;
  cambio: CambioSituacion;
  error?: string;
};

type RefreshBcraUsuariosResponse = {
  totalUsuarios: number;
  procesados: number;
  conCambios: number;
  usuarios: ResultadoRefreshUsuario[];
};

@Injectable()
export class UsuariosService {
  private readonly logger = new Logger(UsuariosService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(DeudaPeriodo)
    private readonly deudaPeriodoRepository: Repository<DeudaPeriodo>,
    @InjectRepository(DeudaEntidad)
    private readonly deudaEntidadRepository: Repository<DeudaEntidad>,
    private readonly bcraService: BcraService,
    private readonly suscripcionesService: SuscripcionesService,
  ) {}

  findAll(clienteId: string): Promise<Usuario[]> {
    return this.usuarioRepository.find({ where: { cliente: { id: clienteId } } });
  }

  async findOne(cuil: string, clienteId: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: { cuil, cliente: { id: clienteId } },
    });
    if (!usuario) throw new NotFoundException(`Usuario ${cuil} no encontrado`);
    return usuario;
  }

  async create(dto: CreateUsuarioDto, clienteId: string): Promise<Usuario> {
    const count = await this.usuarioRepository.count({ where: { clienteId } });
    await this.suscripcionesService.verificarLimite(
      clienteId,
      "maxUsuarios",
      count,
    );
    const count = await this.usuarioRepository.count({ where: { cliente: { id: clienteId } } });
    await this.suscripcionesService.verificarLimite(clienteId, 'maxUsuarios', count);

    const usuario = this.usuarioRepository.create({ ...dto, cliente: { id: clienteId } });
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

  async refreshBcraUsuarios(
    clienteId: string,
  ): Promise<RefreshBcraUsuariosResponse> {
    const usuarios = await this.usuarioRepository.find({
      where: { clienteId },
    });

    const resultados: ResultadoRefreshUsuario[] = [];

    for (const usuario of usuarios) {
      const resultado = await this.refreshBcraUsuario(usuario);
      resultados.push(resultado);
    }

    const usuariosConCambio = resultados.filter(
      (item) => item.cambio === "SUBIO" || item.cambio === "BAJO",
    );

    const conCambios = usuariosConCambio.length;

    return {
      totalUsuarios: usuarios.length,
      procesados: resultados.length,
      conCambios,
      usuarios: usuariosConCambio,
    };
  }

  private async refreshBcraUsuario(
    usuario: Usuario,
  ): Promise<ResultadoRefreshUsuario> {
    const situacionAnterior = await this.obtenerSituacionLocal(usuario.cuil);

    try {
      const bcraData = await this.bcraService.getDeudoresPorCuit(usuario.cuil);
      const situacionNueva = await this.persistirSnapshotBcra(
        usuario.cuil,
        bcraData,
      );

      return {
        cuil: usuario.cuil,
        nombre: usuario.nombre,
        situacionAnterior,
        situacionNueva,
        cambio: this.determinarCambio(situacionAnterior, situacionNueva),
      };
    } catch (error) {
      const message = this.extraerMensajeError(error);
      this.logger.warn(
        `No se pudo refrescar BCRA para ${usuario.cuil}: ${message}`,
      );

      return {
        cuil: usuario.cuil,
        nombre: usuario.nombre,
        situacionAnterior,
        situacionNueva: null,
        cambio: "ERROR",
        error: message,
      };
    }
  }

  private async obtenerSituacionLocal(cuil: string): Promise<number | null> {
    const identificacion = Number(cuil);
    if (Number.isNaN(identificacion)) return null;

    const periodos = await this.deudaPeriodoRepository.find({
      where: { identificacion },
      relations: ["deudas_entidad"],
    });

    if (!periodos.length) return null;

    const ultimoPeriodo = [...periodos].sort(
      (a, b) => this.valorPeriodo(b.periodo) - this.valorPeriodo(a.periodo),
    )[0];

    if (!ultimoPeriodo?.deudas_entidad?.length) return null;
    return Math.max(
      ...ultimoPeriodo.deudas_entidad.map((item) => item.situacion),
    );
  }

  private async persistirSnapshotBcra(
    cuil: string,
    bcraData: Awaited<ReturnType<BcraService["getDeudoresPorCuit"]>>,
  ): Promise<number | null> {
    const identificacion = Number(cuil);
    if (Number.isNaN(identificacion)) {
      throw new Error("CUIL inválido para refrescar BCRA");
    }

    const denominacion =
      bcraData?.results?.denominacion?.trim() || `CUIL ${cuil}`;

    let persona = await this.personaRepository.findOne({
      where: { identificacion },
    });

    if (!persona) {
      persona = this.personaRepository.create({ identificacion, denominacion });
    } else {
      persona.denominacion = denominacion;
    }

    await this.personaRepository.save(persona);

    const periodoReciente = this.obtenerPeriodoMasReciente(
      bcraData?.results?.periodos ?? [],
    );

    if (!periodoReciente) {
      return null;
    }

    let deudaPeriodo = await this.deudaPeriodoRepository.findOne({
      where: {
        identificacion,
        periodo: periodoReciente.periodo,
      },
    });

    if (!deudaPeriodo) {
      deudaPeriodo = this.deudaPeriodoRepository.create({
        identificacion,
        periodo: periodoReciente.periodo,
        fetched_at: new Date(),
      });
    } else {
      deudaPeriodo.fetched_at = new Date();
    }

    const deudaPeriodoSaved =
      await this.deudaPeriodoRepository.save(deudaPeriodo);

    await this.deudaEntidadRepository.delete({
      deuda_periodo_id: deudaPeriodoSaved.id,
    });

    const entidades = periodoReciente.entidades ?? [];

    if (entidades.length > 0) {
      const entidadesParaGuardar = entidades.map((entidad) =>
        this.deudaEntidadRepository.create({
          deuda_periodo_id: deudaPeriodoSaved.id,
          entidad: entidad.entidadNombre ?? String(entidad.entidad),
          situacion: entidad.situacion ?? 0,
          fecha_sit1: null,
          monto: Number(entidad.monto ?? 0),
          dias_atraso_pago: entidad.diasAtrasoPago ?? null,
          refinanciaciones: Boolean(entidad.refinanciaciones),
          recategorizacion_oblig: Boolean(entidad.recategorizacionOblig),
          situacion_juridica: Boolean(entidad.situacionJuridica),
          irrec_disposicion_tecnica: Boolean(entidad.irrecuperables),
          en_revision: Boolean(entidad.enRevision),
          proceso_jud: Boolean(entidad.procesoJud),
        }),
      );

      await this.deudaEntidadRepository.save(entidadesParaGuardar);
    }

    return this.obtenerSituacionDesdePeriodo(periodoReciente);
  }

  private obtenerPeriodoMasReciente(
    periodos: BcraPeriodoDto[],
  ): BcraPeriodoDto | null {
    if (!periodos.length) return null;

    return [...periodos].sort(
      (a, b) => this.valorPeriodo(b.periodo) - this.valorPeriodo(a.periodo),
    )[0];
  }

  private valorPeriodo(periodo: string): number {
    const valor = Number(periodo.replace(/\D/g, ""));
    return Number.isNaN(valor) ? 0 : valor;
  }

  private obtenerSituacionDesdePeriodo(periodo: BcraPeriodoDto): number | null {
    const entidades = periodo.entidades ?? [];
    if (!entidades.length) return null;
    return Math.max(...entidades.map((entidad) => entidad.situacion));
  }

  private determinarCambio(
    situacionAnterior: number | null,
    situacionNueva: number | null,
  ): CambioSituacion {
    if (situacionNueva === null) return "SIN_DATOS_BCRA";
    if (situacionAnterior === null) return "SIN_HISTORICO";
    if (situacionNueva > situacionAnterior) return "SUBIO";
    if (situacionNueva < situacionAnterior) return "BAJO";
    return "SIN_CAMBIO";
  }

  private extraerMensajeError(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Error desconocido";
  }
}
