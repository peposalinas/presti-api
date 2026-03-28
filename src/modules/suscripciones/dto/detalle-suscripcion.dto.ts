import { TipoSuscripcion } from "../enums/tipo-suscripcion.enum";

export class DetalleSuscripcionDto {
  tipo: TipoSuscripcion;
  limites: {
    maxUsuarios: number;
    maxProductos: number;
    maxApiKeys: number;
    maxConsultasDiarias: number;
  };
}
