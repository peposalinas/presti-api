import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcraService } from './bcra/bcra.service';
import { ChequeRechazado } from './entities/cheque-rechazado.entity';
import { DeudaEntidad } from './entities/deuda-entidad.entity';
import { DeudaHistoricaEntidad } from './entities/deuda-historica-entidad.entity';
import { DeudaHistoricaPeriodo } from './entities/deuda-historica-periodo.entity';
import { DeudaPeriodo } from './entities/deuda-periodo.entity';
import { Persona } from './entities/persona.entity';
import { VerazService } from './veraz/veraz.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
    TypeOrmModule.forFeature([
      Persona, DeudaPeriodo, DeudaEntidad,
      DeudaHistoricaPeriodo, DeudaHistoricaEntidad,
      ChequeRechazado,
    ]),
  ],
  providers: [BcraService, VerazService],
  exports: [BcraService, VerazService],
})
export class ExternalApisModule { }
