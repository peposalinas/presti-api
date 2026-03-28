import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recomendacion } from './entities/recomendacion.entity';
import { Regla } from './entities/regla.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { MotorReglasController } from './motor-reglas.controller';
import { MotorReglasService } from './motor-reglas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Regla, Recomendacion, Producto, Usuario])],
  controllers: [MotorReglasController],
  providers: [MotorReglasService],
  exports: [MotorReglasService],
})
export class MotorReglasModule {}
