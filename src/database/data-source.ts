import 'reflect-metadata';
import { setDefaultResultOrder } from 'dns';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// Fuerza resolución DNS en IPv4 (evita ENETUNREACH en hosts con IPv6)
setDefaultResultOrder('ipv4first');

// Carga el .env cuando el CLI de TypeORM ejecuta este archivo directamente
// (fuera del contexto de NestJS). Es un no-op si las vars ya están seteadas.
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  extra: {
    family: 4, // fuerza IPv4, evita errores ENETUNREACH en redes sin IPv6
  },
};

// Export default requerido por el CLI de TypeORM
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
