import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recomendacion } from './entities/recomendacion.entity';
import { Regla } from './entities/regla.entity';
import { MotorReglasController } from './motor-reglas.controller';
import { MotorReglasService } from './motor-reglas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Regla, Recomendacion])],
  controllers: [MotorReglasController],
  providers: [MotorReglasService],
  exports: [MotorReglasService],
})
export class MotorReglasModule {}
