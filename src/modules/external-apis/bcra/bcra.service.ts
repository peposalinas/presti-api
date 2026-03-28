import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { BaseHttpService } from '../base/base-http.service';
import { ChequeRechazado } from '../entities/cheque-rechazado.entity';
import { DeudaEntidad } from '../entities/deuda-entidad.entity';
import { DeudaHistoricaEntidad } from '../entities/deuda-historica-entidad.entity';
import { DeudaHistoricaPeriodo } from '../entities/deuda-historica-periodo.entity';
import { DeudaPeriodo } from '../entities/deuda-periodo.entity';
import { Persona } from '../entities/persona.entity';
import {
  BcraDeudaHistoricaDto,
  BcraDeudorDto,
  BcraDeudorResultadoDto,
} from './dto/bcra-deudor.dto';

// ─── Tipos de respuesta BCRA (cheques) ───────────────────────────────────────

export interface BcraCausal {
  causal: string;
  entidad: number;
  nroCheque: number;
  fechaRechazo: string;
  monto: number;
  fechaPago?: string | null;
  fechaPagoMulta?: string | null;
  estadoMulta?: string | null;
  ctaPersonal?: boolean;
  denomJuridica?: string | null;
  enRevision?: boolean;
  procesoJud?: boolean;
}

export interface BcraChequeResultado {
  identificacion: number;
  denominacion: string;
  causales: BcraCausal[];
}

export interface BcraChequesDto {
  status: number;
  results: BcraChequeResultado;
}

// ─── Resultado combinado de fetchAndPersist ───────────────────────────────────

export interface BcraProfileData {
  identificacion: string;
  denominacion: string;
  deudas: BcraDeudorResultadoDto | null;
  historica: BcraDeudorResultadoDto | null;
  cheques: BcraChequeResultado | null;
}

// ─── Servicio ─────────────────────────────────────────────────────────────────

@Injectable()
export class BcraService extends BaseHttpService {
  constructor(
    httpService: HttpService,
    configService: ConfigService,
    @InjectRepository(Persona)
    private readonly personaRepo: Repository<Persona>,
    @InjectRepository(DeudaPeriodo)
    private readonly deudaPeriodoRepo: Repository<DeudaPeriodo>,
    @InjectRepository(DeudaEntidad)
    private readonly deudaEntidadRepo: Repository<DeudaEntidad>,
    @InjectRepository(DeudaHistoricaPeriodo)
    private readonly deudaHistPeriodoRepo: Repository<DeudaHistoricaPeriodo>,
    @InjectRepository(DeudaHistoricaEntidad)
    private readonly deudaHistEntidadRepo: Repository<DeudaHistoricaEntidad>,
    @InjectRepository(ChequeRechazado)
    private readonly chequeRepo: Repository<ChequeRechazado>,
  ) {
    super(
      httpService,
      configService.get<string>('BCRA_BASE_URL', 'https://api.bcra.gob.ar'),
    );
  }

  /**
   * Consulta la situación crediticia actual de un deudor por CUIT/CUIL/DNI.
   * Endpoint: GET /centraldedeudores/v1.0/Deudas/{identificacion}
   */
  async getDeudoresPorCuit(cuit: string): Promise<BcraDeudorDto> {
    return this.get<BcraDeudorDto>(`/centraldedeudores/v1.0/Deudas/${cuit}`);
  }

  /**
   * Consulta el historial crediticio de un deudor por CUIT/CUIL/DNI.
   * Endpoint: GET /centraldedeudores/v1.0/Deudas/Historicas/{identificacion}
   */
  async getDeudaHistoricaPorCuit(cuit: string): Promise<BcraDeudaHistoricaDto> {
    return this.get<BcraDeudaHistoricaDto>(
      `/centraldedeudores/v1.0/Deudas/Historicas/${cuit}`,
    );
  }

  /**
   * Consulta, persiste y retorna el perfil BCRA completo de un CUIL.
   * Llama los 3 endpoints en paralelo. Si no hay datos en BCRA retorna null.
   */
  async fetchAndPersist(cuil: string): Promise<BcraProfileData | null> {
    const [deudas, historica, cheques] = await Promise.all([
      this.fetchSafe<BcraDeudorDto>(`/centraldedeudores/v1.0/Deudas/${cuil}`),
      this.fetchSafe<BcraDeudaHistoricaDto>(`/centraldedeudores/v1.0/Deudas/Historicas/${cuil}`),
      this.fetchSafe<BcraChequesDto>(`/centraldedeudores/v1.0/Deudas/ChequesRechazados/${cuil}`),
    ]);

    const deudasResult   = deudas?.results   ?? null;
    const historicaResult = historica?.results ?? null;
    const chequesResult   = cheques?.results   ?? null;

    const hayDatos =
      (deudasResult?.periodos?.length ?? 0) > 0 ||
      (historicaResult?.periodos?.length ?? 0) > 0 ||
      (chequesResult?.causales?.length ?? 0) > 0;

    const denominacion =
      deudasResult?.denominacion ??
      historicaResult?.denominacion ??
      chequesResult?.denominacion ??
      null;

    if (!hayDatos && !denominacion) return null;

    await this.persistir(cuil, denominacion ?? '', deudasResult, historicaResult, chequesResult);

    return {
      identificacion: cuil,
      denominacion: denominacion ?? '',
      deudas: deudasResult,
      historica: historicaResult,
      cheques: chequesResult,
    };
  }

  // ─── Helpers de fetch ───────────────────────────────────────────────────────

  /** Llama a un endpoint BCRA y devuelve null en caso de 404 u otro error. */
  private async fetchSafe<T>(path: string): Promise<T | null> {
    try {
      return await this.get<T>(path);
    } catch (err) {
      if (err instanceof HttpException && err.getStatus() === 404) return null;
      this.logger.warn(`BCRA ${path} falló: ${(err as Error).message}`);
      return null;
    }
  }

  // ─── Persistencia ──────────────────────────────────────────────────────────

  private async persistir(
    cuil: string,
    denominacion: string,
    deudas: BcraDeudorResultadoDto | null,
    historica: BcraDeudorResultadoDto | null,
    cheques: BcraChequeResultado | null,
  ): Promise<void> {
    const identificacion = Number(cuil);
    const ahora = new Date();

    // 1. Borrar datos existentes (hijos antes que padres — no hay CASCADE)
    const periodos = await this.deudaPeriodoRepo.find({ where: { identificacion } });
    if (periodos.length > 0) {
      await this.deudaEntidadRepo.delete({ deuda_periodo_id: In(periodos.map((p) => p.id)) });
    }
    await this.deudaPeriodoRepo.delete({ identificacion });

    const histPeriodos = await this.deudaHistPeriodoRepo.find({ where: { identificacion } });
    if (histPeriodos.length > 0) {
      await this.deudaHistEntidadRepo.delete({
        deuda_hist_periodo_id: In(histPeriodos.map((p) => p.id)),
      });
    }
    await this.deudaHistPeriodoRepo.delete({ identificacion });

    await this.chequeRepo.delete({ identificacion });

    // 2. Upsert persona
    await this.personaRepo.upsert(
      { identificacion, denominacion },
      { conflictPaths: ['identificacion'], skipUpdateIfNoValuesChanged: false },
    );

    // 3. Insertar deudas actuales
    for (const periodo of deudas?.periodos ?? []) {
      const dp = await this.deudaPeriodoRepo.save(
        this.deudaPeriodoRepo.create({ identificacion, periodo: periodo.periodo, fetched_at: ahora }),
      );
      for (const e of periodo.entidades ?? []) {
        await this.deudaEntidadRepo.save(
          this.deudaEntidadRepo.create({
            deuda_periodo_id: dp.id,
            entidad: e.entidadNombre ?? String(e.entidad),
            situacion: e.situacion,
            fecha_sit1: null,
            monto: e.monto,
            dias_atraso_pago: e.diasAtrasoPago ?? null,
            refinanciaciones: e.refinanciaciones ?? false,
            recategorizacion_oblig: e.recategorizacionOblig ?? false,
            situacion_juridica: e.situacionJuridica ?? false,
            irrec_disposicion_tecnica: e.irrecuperables ?? false,
            en_revision: e.enRevision ?? false,
            proceso_jud: e.procesoJud ?? false,
          }),
        );
      }
    }

    // 4. Insertar deudas históricas
    for (const periodo of historica?.periodos ?? []) {
      const dhp = await this.deudaHistPeriodoRepo.save(
        this.deudaHistPeriodoRepo.create({ identificacion, periodo: periodo.periodo, fetched_at: ahora }),
      );
      for (const e of periodo.entidades ?? []) {
        await this.deudaHistEntidadRepo.save(
          this.deudaHistEntidadRepo.create({
            deuda_hist_periodo_id: dhp.id,
            entidad: e.entidadNombre ?? String(e.entidad),
            situacion: e.situacion,
            monto: e.monto,
            en_revision: e.enRevision ?? false,
            proceso_jud: e.procesoJud ?? false,
          }),
        );
      }
    }

    // 5. Insertar cheques rechazados
    for (const ch of cheques?.causales ?? []) {
      await this.chequeRepo.save(
        this.chequeRepo.create({
          identificacion,
          causal: ch.causal,
          entidad: ch.entidad,
          nro_cheque: ch.nroCheque,
          fecha_rechazo: new Date(ch.fechaRechazo),
          monto: ch.monto,
          fecha_pago: ch.fechaPago ? new Date(ch.fechaPago) : null,
          fecha_pago_multa: ch.fechaPagoMulta ? new Date(ch.fechaPagoMulta) : null,
          estado_multa: ch.estadoMulta ?? null,
          cta_personal: ch.ctaPersonal ?? false,
          denom_juridica: ch.denomJuridica ?? null,
          en_revision: ch.enRevision ?? false,
          proceso_jud: ch.procesoJud ?? false,
          fetched_at: ahora,
        }),
      );
    }
  }
}
