import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientesModule } from "../clientes/clientes.module";
import { ExternalApisModule } from "../external-apis/external-apis.module";
import { DeudaEntidad } from "../external-apis/entities/deuda-entidad.entity";
import { DeudaPeriodo } from "../external-apis/entities/deuda-periodo.entity";
import { Persona } from "../external-apis/entities/persona.entity";
import { SuscripcionesModule } from "../suscripciones/suscripciones.module";
import { Usuario } from "./entities/usuario.entity";
import { UsuariosController } from "./usuarios.controller";
import { UsuariosService } from "./usuarios.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Persona, DeudaPeriodo, DeudaEntidad]),
    SuscripcionesModule,
    ExternalApisModule,
    ClientesModule,
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}
