import { TipoSuscripcion } from '../enums/tipo-suscripcion.enum';

export interface LimitesSuscripcion {
  maxUsuarios:         number;
  maxProductos:        number;
  maxTiposProducto:    number;
  maxApiKeys:          number;
  maxConsultasDiarias: number;
}

export const LIMITES_SUSCRIPCION: Record<TipoSuscripcion, LimitesSuscripcion> = {
  [TipoSuscripcion.PROFESSIONAL]: {
    maxUsuarios:         10,
    maxProductos:        5,
    maxTiposProducto:    3,
    maxApiKeys:          2,
    maxConsultasDiarias: 100,
  },
  [TipoSuscripcion.BUSINESS]: {
    maxUsuarios:         50,
    maxProductos:        20,
    maxTiposProducto:    10,
    maxApiKeys:          5,
    maxConsultasDiarias: 500,
  },
  [TipoSuscripcion.ENTERPRISE]: {
    maxUsuarios:         500,
    maxProductos:        200,
    maxTiposProducto:    50,
    maxApiKeys:          20,
    maxConsultasDiarias: 5000,
  },
};
