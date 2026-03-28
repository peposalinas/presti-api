import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuscripcionesModule } from '../suscripciones/suscripciones.module';
import { Producto } from './entities/producto.entity';
import { TipoProducto } from './entities/tipo-producto.entity';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  imports: [TypeOrmModule.forFeature([TipoProducto, Producto]), SuscripcionesModule],
  controllers: [ProductosController],
  providers: [ProductosService],
  exports: [ProductosService],
})
export class ProductosModule {}
