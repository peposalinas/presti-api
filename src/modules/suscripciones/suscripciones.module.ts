import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from '../clientes/entities/cliente.entity';
import { ClienteSuscripcion } from './entities/cliente-suscripcion.entity';
import { RegistroUso } from './entities/registro-uso.entity';
import { SuscripcionesController } from './suscripciones.controller';
import { SuscripcionesService } from './suscripciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteSuscripcion, RegistroUso, Cliente])],
  controllers: [SuscripcionesController],
  providers: [SuscripcionesService],
  exports: [SuscripcionesService],
})
export class SuscripcionesModule {}
