import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ExternalApisModule } from './modules/external-apis/external-apis.module';
import { MotorReglasModule } from './modules/motor-reglas/motor-reglas.module';
import { ProductosModule } from './modules/productos/productos.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';

@Module({
  imports: [
    // ConfigModule carga el .env y expone ConfigService de forma global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM reutiliza el mismo dataSourceOptions que usa el CLI de migraciones
    TypeOrmModule.forRoot(dataSourceOptions),
    // Módulos de dominio
    ClientesModule,
    UsuariosModule,
    ProductosModule,
    MotorReglasModule,
    // APIs externas
    ExternalApisModule,
  ],
})
export class AppModule {}
