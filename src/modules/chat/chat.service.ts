import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { BcraService } from '../external-apis/bcra/bcra.service';
import { GeminiService } from '../ai/gemini.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly geminiService: GeminiService,
    private readonly bcraService: BcraService,
  ) {}

  async chat(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const dataSources: string[] = [];
    let bcraContext = '';

    // Si se proporcionó un CUIL, enriquecer con datos del BCRA
    if (dto.cuil) {
      try {
        const [deudas, historico] = await Promise.allSettled([
          this.bcraService.getDeudoresPorCuit(dto.cuil),
          this.bcraService.getDeudaHistoricaPorCuit(dto.cuil),
        ]);

        if (deudas.status === 'fulfilled' && deudas.value) {
          bcraContext += `\n--- DATOS BCRA - SITUACIÓN ACTUAL ---\n${JSON.stringify(deudas.value, null, 2)}`;
          dataSources.push('BCRA - Central de Deudores (Situación Actual)');
        }

        if (historico.status === 'fulfilled' && historico.value) {
          bcraContext += `\n--- DATOS BCRA - HISTORIAL CREDITICIO (24 meses) ---\n${JSON.stringify(historico.value, null, 2)}`;
          dataSources.push('BCRA - Central de Deudores (Historial)');
        }

        if (deudas.status === 'rejected') {
          this.logger.warn(`Error al consultar deudas BCRA: ${deudas.reason}`);
          bcraContext += '\n--- BCRA: No se pudieron obtener las deudas actuales ---';
        }

        if (historico.status === 'rejected') {
          this.logger.warn(`Error al consultar historial BCRA: ${historico.reason}`);
          bcraContext += '\n--- BCRA: No se pudo obtener el historial crediticio ---';
        }
      } catch (error) {
        this.logger.error('Error general al consultar BCRA', error);
        bcraContext = '\n--- Error al consultar fuentes BCRA ---';
      }
    }

    // Armar contexto completo
    const fullContext = [
      bcraContext,
      dto.context ? `\nContexto adicional del usuario: ${dto.context}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // Generar respuesta con Gemini
    try {
      const response = await this.geminiService.generateResponse(
        dto.message,
        fullContext || undefined,
      );

      return {
        response,
        ...(dataSources.length > 0 && { dataSources }),
      };
    } catch (error) {
      this.logger.error('Error al generar respuesta de Gemini', error?.message || error);
      throw new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Error al comunicarse con el servicio de IA',
          error: error?.message || 'Unknown error',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
