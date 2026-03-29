import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { BcraProfileData } from '../external-apis/bcra/bcra.service';
import { CambioSituacion } from './entities/cambio-situacion.entity';
import { ConsultaUsuario } from './entities/consulta-usuario.entity';

@Injectable()
export class CarteraService {
  constructor(
    @InjectRepository(ConsultaUsuario)
    private readonly consultaRepo: Repository<ConsultaUsuario>,
    @InjectRepository(CambioSituacion)
    private readonly cambioRepo: Repository<CambioSituacion>,
  ) {}

  private extraerSituacion(bcraData: BcraProfileData | null): number | null {
    const periodos = bcraData?.deudas?.periodos;
    if (!periodos?.length) return null;

    const ultimoPeriodo = periodos
      .slice()
      .sort((a, b) => b.periodo.localeCompare(a.periodo))[0];

    const entidades = ultimoPeriodo.entidades ?? [];
    if (entidades.length === 0) return null;

    return Math.max(...entidades.map((e) => e.situacion));
  }

  async registrarConsulta(
    clienteId: string,
    cuil: string,
    bcraData: BcraProfileData | null,
  ): Promise<void> {
    const situacion = this.extraerSituacion(bcraData);

    const existente = await this.consultaRepo.findOne({
      where: { cliente: { id: clienteId }, cuil },
    });

    if (existente) {
      existente.situacion = situacion;
      await this.consultaRepo.save(existente);
    } else {
      await this.consultaRepo.save(
        this.consultaRepo.create({
          cliente: { id: clienteId },
          cuil,
          situacion,
        }),
      );
    }
  }

  getPortfolio(clienteId: string, meses: number): Promise<CambioSituacion[]> {
    const desde = new Date();
    desde.setMonth(desde.getMonth() - meses);

    return this.cambioRepo.find({
      where: {
        cliente: { id: clienteId },
        detectadoAt: MoreThan(desde),
      },
      order: { detectadoAt: 'DESC' },
    });
  }
}
