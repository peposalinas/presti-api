import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcraService } from './bcra/bcra.service';
import { DeudaActual } from './entities/deuda-actual.entity';
import { Entidad } from './entities/entidad.entity';
import { HistorialCrediticio } from './entities/historial-crediticio.entity';
import { Persona } from './entities/persona.entity';
import { VerazService } from './veraz/veraz.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    TypeOrmModule.forFeature([Entidad, Persona, DeudaActual, HistorialCrediticio]),
  ],
  providers: [BcraService, VerazService],
  exports: [BcraService, VerazService],
})
export class ExternalApisModule {}
