import "reflect-metadata";
import { setDefaultResultOrder } from "dns";
import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { ApiKey } from "../modules/clientes/entities/api-key.entity";
import { Cliente } from "../modules/clientes/entities/cliente.entity";
import { ChequeRechazado } from "../modules/external-apis/entities/cheque-rechazado.entity";
import { DeudaEntidad } from "../modules/external-apis/entities/deuda-entidad.entity";
import { DeudaHistoricaEntidad } from "../modules/external-apis/entities/deuda-historica-entidad.entity";
import { DeudaHistoricaPeriodo } from "../modules/external-apis/entities/deuda-historica-periodo.entity";
import { DeudaPeriodo } from "../modules/external-apis/entities/deuda-periodo.entity";
import { Persona } from "../modules/external-apis/entities/persona.entity";
import { CambioSituacion } from "../modules/cartera/entities/cambio-situacion.entity";
import { ConsultaUsuario } from "../modules/cartera/entities/consulta-usuario.entity";
import { Recomendacion } from "../modules/motor-reglas/entities/recomendacion.entity";
import { PoliticaCrediticia } from "../modules/politica-crediticia/entities/politica-crediticia.entity";
import { Producto } from "../modules/productos/entities/producto.entity";
import { ClienteSuscripcion } from "../modules/suscripciones/entities/cliente-suscripcion.entity";
import { RegistroUso } from "../modules/suscripciones/entities/registro-uso.entity";
import { Usuario } from "../modules/usuarios/entities/usuario.entity";

// Fuerza resolución DNS en IPv4 (evita ENETUNREACH en hosts con IPv6)
setDefaultResultOrder("ipv4first");

// Carga el .env cuando el CLI de TypeORM ejecuta este archivo directamente
// (fuera del contexto de NestJS). Es un no-op si las vars ya están seteadas.
config();

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [
    Cliente,
    ApiKey,
    Usuario,
    Producto,
    PoliticaCrediticia,
    Recomendacion,
    ConsultaUsuario,
    CambioSituacion,
    ClienteSuscripcion,
    RegistroUso,
    Persona,
    DeudaPeriodo,
    DeudaEntidad,
    DeudaHistoricaPeriodo,
    DeudaHistoricaEntidad,
    ChequeRechazado,
  ],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV === "development",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    family: 4, // fuerza IPv4, evita errores ENETUNREACH en redes sin IPv6
  },
};

// Export default requerido por el CLI de TypeORM
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
