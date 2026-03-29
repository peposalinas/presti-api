import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { JwtOrApiKeyAuthGuard } from '../auth/guards/jwt-or-api-key-auth.guard';
import { SuscripcionesModule } from '../suscripciones/suscripciones.module';
import { PoliticaCrediticiaModule } from '../politica-crediticia/politica-crediticia.module';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ApiKey } from './entities/api-key.entity';
import { Cliente } from './entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, ApiKey]), SuscripcionesModule, PoliticaCrediticiaModule],
  controllers: [ApiKeysController, ClientesController],
  providers: [ClientesService, ApiKeysService, ApiKeyAuthGuard, JwtOrApiKeyAuthGuard],
  exports: [ClientesService, ApiKeysService, ApiKeyAuthGuard, JwtOrApiKeyAuthGuard],
})
export class ClientesModule {}
