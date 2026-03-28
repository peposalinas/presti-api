import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private groq: Groq;

  private readonly SYSTEM_INSTRUCTION = `Sos un analista crediticio experto argentino que trabaja para "Presti", un motor de decisión fintech.
Tu rol es ayudar a analizar la situación financiera de personas basándote en datos de fuentes oficiales (BCRA Central de Deudores, etc.).

Reglas:
- Respondé siempre en español argentino.
- Sé conciso y profesional.
- Cuando te pasen datos del BCRA, analizalos en detalle: situación crediticia, montos de deuda, entidades, días de atraso, etc.
- Si no hay datos disponibles, indicalo claramente.
- Podés dar recomendaciones sobre si una persona es apta para un crédito, pero siempre aclarando que es una sugerencia basada en los datos disponibles.
- Si te preguntan algo fuera del ámbito financiero/crediticio, redirigí la conversación amablemente.
- Usá formato claro con bullets cuando sea necesario.`;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) {
      this.logger.warn(
        'GROQ_API_KEY no configurada — el módulo de chat no funcionará',
      );
      return;
    }

    this.groq = new Groq({ apiKey });
    this.logger.log('Groq inicializado correctamente');
  }

  async generateResponse(
    prompt: string,
    additionalContext?: string,
  ): Promise<string> {
    if (!this.groq) {
      return 'El servicio de IA no está configurado. Verificá que GROQ_API_KEY esté en el .env.';
    }

    const userMessage = additionalContext
      ? `Contexto con datos reales:\n${additionalContext}\n\nPregunta del usuario:\n${prompt}`
      : prompt;

    const chatCompletion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: this.SYSTEM_INSTRUCTION },
        { role: 'user', content: userMessage },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || 'Sin respuesta';
  }
}
