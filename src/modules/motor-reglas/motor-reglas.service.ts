import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecomendacionDto } from './dto/create-recomendacion.dto';
import { CreateReglaDto } from './dto/create-regla.dto';
import { UpdateReglaDto } from './dto/update-regla.dto';
import { Recomendacion } from './entities/recomendacion.entity';
import { Regla } from './entities/regla.entity';

@Injectable()
export class MotorReglasService {
  constructor(
    @InjectRepository(Regla)
    private readonly reglaRepository: Repository<Regla>,
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
  ) {}

  // ── Reglas ────────────────────────────────────────────────────────────────

  findAllReglas(clienteId: string): Promise<Regla[]> {
    return this.reglaRepository.find({
      where: { clienteId },
      order: { prioridad: 'ASC' },
    });
  }

  async findOneRegla(id: string, clienteId: string): Promise<Regla> {
    const regla = await this.reglaRepository.findOne({
      where: { id, clienteId },
    });
    if (!regla) throw new NotFoundException(`Regla ${id} no encontrada`);
    return regla;
  }

  createRegla(dto: CreateReglaDto, clienteId: string): Promise<Regla> {
    const regla = this.reglaRepository.create({ ...dto, clienteId });
    return this.reglaRepository.save(regla);
  }

  async updateRegla(
    id: string,
    dto: UpdateReglaDto,
    clienteId: string,
  ): Promise<Regla> {
    const regla = await this.findOneRegla(id, clienteId);
    Object.assign(regla, dto);
    return this.reglaRepository.save(regla);
  }

  async removeRegla(id: string, clienteId: string): Promise<void> {
    const regla = await this.findOneRegla(id, clienteId);
    await this.reglaRepository.remove(regla);
  }

  // ── Recomendaciones ───────────────────────────────────────────────────────

  findAllRecomendaciones(clienteId: string): Promise<Recomendacion[]> {
    return this.recomendacionRepository.find({
      where: { clienteId },
      order: { timestamp: 'DESC' },
    });
  }

  async findOneRecomendacion(id: string, clienteId: string): Promise<Recomendacion> {
    const rec = await this.recomendacionRepository.findOne({
      where: { id, clienteId },
    });
    if (!rec) throw new NotFoundException(`Recomendacion ${id} no encontrada`);
    return rec;
  }

  createRecomendacion(
    dto: CreateRecomendacionDto,
    clienteId: string,
  ): Promise<Recomendacion> {
    const rec = this.recomendacionRepository.create({ ...dto, clienteId });
    return this.recomendacionRepository.save(rec);
  }
}
