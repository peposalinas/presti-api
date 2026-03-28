import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  async create(clienteId: string): Promise<ApiKey> {
    const apiKey = this.apiKeyRepository.create({
      api_key: randomUUID(),
      clienteId,
      activo: true,
    });
    return this.apiKeyRepository.save(apiKey);
  }

  findAllByCliente(clienteId: string): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({ where: { clienteId } });
  }

  async deactivate(apiKey: string, clienteId: string): Promise<void> {
    const key = await this.apiKeyRepository.findOne({
      where: { api_key: apiKey, clienteId },
    });

    if (!key) {
      throw new NotFoundException('API Key no encontrada');
    }

    if (!key.activo) {
      throw new BadRequestException('La API Key ya está desactivada');
    }

    await this.apiKeyRepository.update({ api_key: apiKey }, { activo: false });
  }

  findActiveKey(apiKey: string): Promise<ApiKey | null> {
    return this.apiKeyRepository.findOne({
      where: { api_key: apiKey, activo: true },
    });
  }
}
