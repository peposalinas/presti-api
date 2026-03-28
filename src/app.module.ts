import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { dataSourceOptions } from './database/data-source';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { ClientesModule } from './modules/clientes/clientes.module';
import { ExternalApisModule } from './modules/external-apis/external-apis.module';
import { MotorReglasModule } from './modules/motor-reglas/motor-reglas.module';
import { ProductosModule } from './modules/productos/productos.module';
import { SuscripcionesModule } from './modules/suscripciones/suscripciones.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    // Auth
    AuthModule,
    // Módulos de dominio
    ClientesModule,
    UsuariosModule,
    ProductosModule,
    MotorReglasModule,
    SuscripcionesModule,
    // APIs externas
    ExternalApisModule,
    // Chat con IA
    ChatModule,
  ],
  providers: [
    // Guard JWT aplicado globalmente — las rutas públicas usan @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
