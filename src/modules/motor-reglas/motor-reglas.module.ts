import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientesModule } from "../clientes/clientes.module";
import { ExternalApisModule } from "../external-apis/external-apis.module";
import { SuscripcionesModule } from "../suscripciones/suscripciones.module";
import { Producto } from "../productos/entities/producto.entity";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { GroqRecomendacionesService } from "./groq-recomendaciones.service";
import { Recomendacion } from "./entities/recomendacion.entity";
import { Regla } from "./entities/regla.entity";
import { MotorReglasController } from "./motor-reglas.controller";
import { MotorReglasService } from "./motor-reglas.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Regla, Recomendacion, Producto, Usuario]),
    ClientesModule,
    ExternalApisModule,
    SuscripcionesModule,
  ],
  controllers: [MotorReglasController],
  providers: [MotorReglasService, GroqRecomendacionesService],
  exports: [MotorReglasService, GroqRecomendacionesService],
})
export class MotorReglasModule {}
