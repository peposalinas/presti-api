import { HttpService } from "@nestjs/axios";
import { HttpException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { BaseHttpService } from "../base/base-http.service";
import { ChequeRechazado } from "../entities/cheque-rechazado.entity";
import { DeudaEntidad } from "../entities/deuda-entidad.entity";
import { DeudaHistoricaEntidad } from "../entities/deuda-historica-entidad.entity";
import { DeudaHistoricaPeriodo } from "../entities/deuda-historica-periodo.entity";
import { DeudaPeriodo } from "../entities/deuda-periodo.entity";
import { Persona } from "../entities/persona.entity";
import {
  BcraDeudaHistoricaDto,
  BcraDeudorDto,
  BcraDeudorResultadoDto,
} from "./dto/bcra-deudor.dto";

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

export interface BcraProfileData {
  identificacion: string;
  denominacion: string;
  deudas: BcraDeudorResultadoDto | null;
  historica: BcraDeudorResultadoDto | null;
  cheques: BcraChequeResultado | null;
}

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
      configService.get<string>("BCRA_BASE_URL", "https://api.bcra.gob.ar"),
    );
  }

  async getDeudoresPorCuit(cuit: string): Promise<BcraDeudorDto> {
    return this.get<BcraDeudorDto>(`/CentralDeDeudores/v1.0/Deudas/${cuit}`);
  }

  async getDeudaHistoricaPorCuit(cuit: string): Promise<BcraDeudaHistoricaDto> {
    return this.get<BcraDeudaHistoricaDto>(
      `/CentralDeDeudores/v1.0/Deudas/Historicas/${cuit}`,
    );
  }

  async fetchAndPersist(cuil: string): Promise<BcraProfileData | null> {
    const [deudas, historica, cheques] = await Promise.all([
      this.fetchSafe<BcraDeudorDto>(`/CentralDeDeudores/v1.0/Deudas/${cuil}`),
      this.fetchSafe<BcraDeudaHistoricaDto>(
        `/CentralDeDeudores/v1.0/Deudas/Historicas/${cuil}`,
      ),
      this.fetchSafe<BcraChequesDto>(
        `/CentralDeDeudores/v1.0/Deudas/ChequesRechazados/${cuil}`,
      ),
    ]);

    const deudasResult = deudas?.results ?? null;
    const historicaResult = historica?.results ?? null;
    const chequesResult = cheques?.results ?? null;

    const hayDatos =
      (deudasResult?.periodos?.length ?? 0) > 0 ||
      (historicaResult?.periodos?.length ?? 0) > 0 ||
      (chequesResult?.causales?.length ?? 0) > 0;

    const denominacion =
      deudasResult?.denominacion ??
      historicaResult?.denominacion ??
      chequesResult?.denominacion ??
      null;

    if (!hayDatos && !denominacion) {
      return null;
    }

    await this.persistir(
      cuil,
      denominacion ?? "",
      deudasResult,
      historicaResult,
      chequesResult,
    );

    return {
      identificacion: cuil,
      denominacion: denominacion ?? "",
      deudas: deudasResult,
      historica: historicaResult,
      cheques: chequesResult,
    };
  }

  private async fetchSafe<T>(path: string): Promise<T | null> {
    try {
      return await this.get<T>(path);
    } catch (error) {
      if (error instanceof HttpException && error.getStatus() === 404) {
        return null;
      }

      this.logger.warn(`BCRA ${path} fallo: ${(error as Error).message}`);
      return null;
    }
  }

  private async persistir(
    cuil: string,
    denominacion: string,
    deudas: BcraDeudorResultadoDto | null,
    historica: BcraDeudorResultadoDto | null,
    cheques: BcraChequeResultado | null,
  ): Promise<void> {
    const identificacion = Number(cuil);
    const ahora = new Date();

    const periodos = await this.deudaPeriodoRepo.find({
      where: { identificacion },
    });
    if (periodos.length > 0) {
      await this.deudaEntidadRepo.delete({
        deuda_periodo_id: In(periodos.map((periodo) => periodo.id)),
      });
    }
    await this.deudaPeriodoRepo.delete({ identificacion });

    const histPeriodos = await this.deudaHistPeriodoRepo.find({
      where: { identificacion },
    });
    if (histPeriodos.length > 0) {
      await this.deudaHistEntidadRepo.delete({
        deuda_hist_periodo_id: In(histPeriodos.map((periodo) => periodo.id)),
      });
    }
    await this.deudaHistPeriodoRepo.delete({ identificacion });

    await this.chequeRepo.delete({ identificacion });

    await this.personaRepo.upsert(
      { identificacion, denominacion },
      { conflictPaths: ["identificacion"], skipUpdateIfNoValuesChanged: false },
    );

    for (const periodo of deudas?.periodos ?? []) {
      const deudaPeriodo = await this.deudaPeriodoRepo.save(
        this.deudaPeriodoRepo.create({
          identificacion,
          periodo: periodo.periodo,
          fetched_at: ahora,
        }),
      );

      for (const entidad of periodo.entidades ?? []) {
        await this.deudaEntidadRepo.save(
          this.deudaEntidadRepo.create({
            deuda_periodo_id: deudaPeriodo.id,
            entidad: entidad.entidadNombre ?? String(entidad.entidad),
            situacion: entidad.situacion,
            fecha_sit1: null,
            monto: Number(entidad.monto ?? 0),
            dias_atraso_pago: entidad.diasAtrasoPago ?? null,
            refinanciaciones: entidad.refinanciaciones ?? false,
            recategorizacion_oblig: entidad.recategorizacionOblig ?? false,
            situacion_juridica: entidad.situacionJuridica ?? false,
            irrec_disposicion_tecnica: entidad.irrecuperables ?? false,
            en_revision: entidad.enRevision ?? false,
            proceso_jud: entidad.procesoJud ?? false,
          }),
        );
      }
    }

    for (const periodo of historica?.periodos ?? []) {
      const deudaHistPeriodo = await this.deudaHistPeriodoRepo.save(
        this.deudaHistPeriodoRepo.create({
          identificacion,
          periodo: periodo.periodo,
          fetched_at: ahora,
        }),
      );

      for (const entidad of periodo.entidades ?? []) {
        await this.deudaHistEntidadRepo.save(
          this.deudaHistEntidadRepo.create({
            deuda_hist_periodo_id: deudaHistPeriodo.id,
            entidad: entidad.entidadNombre ?? String(entidad.entidad),
            situacion: entidad.situacion,
            monto: Number(entidad.monto ?? 0),
            en_revision: entidad.enRevision ?? false,
            proceso_jud: entidad.procesoJud ?? false,
          }),
        );
      }
    }

    for (const cheque of cheques?.causales ?? []) {
      await this.chequeRepo.save(
        this.chequeRepo.create({
          identificacion,
          causal: cheque.causal,
          entidad: cheque.entidad,
          nro_cheque: cheque.nroCheque,
          fecha_rechazo: new Date(cheque.fechaRechazo),
          monto: Number(cheque.monto ?? 0),
          fecha_pago: cheque.fechaPago ? new Date(cheque.fechaPago) : null,
          fecha_pago_multa: cheque.fechaPagoMulta
            ? new Date(cheque.fechaPagoMulta)
            : null,
          estado_multa: cheque.estadoMulta ?? null,
          cta_personal: cheque.ctaPersonal ?? false,
          denom_juridica: cheque.denomJuridica ?? null,
          en_revision: cheque.enRevision ?? false,
          proceso_jud: cheque.procesoJud ?? false,
          fetched_at: ahora,
        }),
      );
    }
  }
}
