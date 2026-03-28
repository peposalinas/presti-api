import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { BaseHttpService } from '../base/base-http.service';
import { VerazReporteDto } from './dto/veraz-reporte.dto';

@Injectable()
export class VerazService extends BaseHttpService {
  constructor(
    httpService: HttpService,
    configService: ConfigService,
  ) {
    const username = configService.get<string>('VERAZ_USERNAME', '');
    const password = configService.get<string>('VERAZ_PASSWORD', '');
    const apiKey = configService.get<string>('VERAZ_API_KEY', '');

    const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

    super(
      httpService,
      configService.get<string>('VERAZ_BASE_URL', 'https://api.veraz.com.ar'),
      {
        Authorization: `Basic ${basicAuth}`,
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
    );
  }

  /**
   * Obtiene el reporte crediticio de una persona por CUIT.
   * Endpoint y estructura de respuesta deben ajustarse según la documentación
   * oficial de VERAZ una vez contratado el servicio.
   */
  async getReportePorCuit(cuit: string): Promise<VerazReporteDto> {
    return this.post<VerazReporteDto>('/reporte/persona', { cuit });
  }
}
