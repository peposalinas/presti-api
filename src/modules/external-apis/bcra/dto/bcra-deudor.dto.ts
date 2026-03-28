export class BcraEntidadDto {
  entidad: number;
  entidadNombre: string;
  situacion: number;
  monto: number;
  diasAtrasoPago: number;
  refinanciaciones: boolean;
  recategorizacionOblig: boolean;
  situacionJuridica: boolean;
  irrecuperables: boolean;
  enRevision: boolean;
  procesoJud: boolean;
}

export class BcraPeriodoDto {
  periodo: string;
  entidades: BcraEntidadDto[];
}

export class BcraDeudorResultadoDto {
  identificacion: number;
  denominacion: string;
  periodos: BcraPeriodoDto[];
}

export class BcraDeudorDto {
  status: number;
  results: BcraDeudorResultadoDto;
}

export class BcraDeudaHistoricaDto {
  status: number;
  results: BcraDeudorResultadoDto;
}
