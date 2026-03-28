import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BaseHttpService } from '../base/base-http.service';
import {
  BcraDeudaHistoricaDto,
  BcraDeudorDto,
} from './dto/bcra-deudor.dto';

@Injectable()
export class BcraService extends BaseHttpService {
  constructor(
    httpService: HttpService,
    configService: ConfigService,
  ) {
    super(
      httpService,
      configService.get<string>('BCRA_BASE_URL', 'https://api.bcra.gob.ar'),
      // La API del BCRA es pública, no requiere autenticación
    );
  }

  /**
   * Consulta la situación crediticia actual de un deudor por CUIT/CUIL/DNI.
   * Endpoint: GET /centraldedeudores/v1.0/Deudas/{identificacion}
   */
  async getDeudoresPorCuit(cuit: string): Promise<BcraDeudorDto> {
    return this.get<BcraDeudorDto>(
      `/centraldedeudores/v1.0/Deudas/${cuit}`,
    );
  }

  /**
   * Consulta el historial crediticio de un deudor por CUIT/CUIL/DNI.
   * Endpoint: GET /centraldedeudores/v1.0/Deudas/Historicas/{identificacion}
   */
  async getDeudaHistoricaPorCuit(cuit: string): Promise<BcraDeudaHistoricaDto> {
    return this.get<BcraDeudaHistoricaDto>(
      `/centraldedeudores/v1.0/Deudas/Historicas/${cuit}`,
    );
  }
}
