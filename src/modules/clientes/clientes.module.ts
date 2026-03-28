import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ApiKey } from './entities/api-key.entity';
import { Cliente } from './entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, ApiKey])],
  controllers: [ApiKeysController, ClientesController],
  providers: [ClientesService, ApiKeysService, ApiKeyAuthGuard],
  exports: [ClientesService, ApiKeysService, ApiKeyAuthGuard],
})
export class ClientesModule {}
