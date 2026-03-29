import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarteraController } from './cartera.controller';
import { CarteraService } from './cartera.service';
import { CambioSituacion } from './entities/cambio-situacion.entity';
import { ConsultaUsuario } from './entities/consulta-usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultaUsuario, CambioSituacion])],
  controllers: [CarteraController],
  providers: [CarteraService],
  exports: [CarteraService],
})
export class CarteraModule {}
