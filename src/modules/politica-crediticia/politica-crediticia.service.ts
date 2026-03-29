import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BcraProfileData } from '../external-apis/bcra/bcra.service';
import { UpdatePoliticaCrediticiaDto } from './dto/update-politica-crediticia.dto';
import { PoliticaCrediticia } from './entities/politica-crediticia.entity';

@Injectable()
export class PoliticaCrediticiaService {
  constructor(
    @InjectRepository(PoliticaCrediticia)
    private readonly repo: Repository<PoliticaCrediticia>,
  ) {}

  async findByCliente(clienteId: string): Promise<PoliticaCrediticia> {
    const politica = await this.repo.findOne({
      where: { cliente: { id: clienteId } },
    });
    if (!politica)
      throw new NotFoundException(
        `Política crediticia para el cliente ${clienteId} no encontrada`,
      );
    return politica;
  }

  createDefault(clienteId: string): Promise<PoliticaCrediticia> {
    return this.repo.save(
      this.repo.create({ cliente: { id: clienteId } }),
    );
  }

  async update(
    clienteId: string,
    dto: UpdatePoliticaCrediticiaDto,
  ): Promise<PoliticaCrediticia> {
    const politica = await this.findByCliente(clienteId);
    Object.assign(politica, dto);
    return this.repo.save(politica);
  }

  evaluarPerfil(politica: PoliticaCrediticia, bcraData: BcraProfileData | null): boolean {
    if (!bcraData) return true;

    const ultimoPeriodo = bcraData.deudas?.periodos
      ?.slice()
      .sort((a, b) => b.periodo.localeCompare(a.periodo))[0];

    if (ultimoPeriodo) {
      const entidades = ultimoPeriodo.entidades ?? [];

      const maxSit = entidades.length > 0
        ? Math.max(...entidades.map((e) => e.situacion))
        : 0;
      if (maxSit > politica.maxSituacionCrediticiaPermitida) return false;

      if (entidades.length > politica.maxEntidadesConDeuda) return false;

      const totalMonto = entidades.reduce((s, e) => s + Number(e.monto ?? 0), 0);
      if (totalMonto > Number(politica.maxDeudaTotalExterna)) return false;
    }

    if (politica.mesesHistorialLimpioRequerido > 0 && bcraData.historica?.periodos?.length) {
      const periodosDesc = bcraData.historica.periodos
        .slice()
        .sort((a, b) => b.periodo.localeCompare(a.periodo))
        .slice(0, politica.mesesHistorialLimpioRequerido);

      for (const periodo of periodosDesc) {
        for (const entidad of periodo.entidades ?? []) {
          if (entidad.situacion > 1) return false;
        }
      }
    }

    return true;
  }
}
