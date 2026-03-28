import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import OpenAI from "openai";

type RecomendacionesResponse = {
  recomendaciones: string[];
};

@Injectable()
export class GroqRecomendacionesService {
  private readonly logger = new Logger(GroqRecomendacionesService.name);

  private readonly client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  async obtenerRecomendaciones(perfil: {
    edad: number;
    estadoCivil: string;
    ingreso: number;
  }): Promise<RecomendacionesResponse> {
    return this.generarRecomendaciones(perfil);
  }

  async obtenerRecomendacionesPersonalizadas(
    payload: Record<string, unknown>,
  ): Promise<RecomendacionesResponse> {
    return this.generarRecomendaciones(payload);
  }

  private async generarRecomendaciones(
    datos: Record<string, unknown>,
  ): Promise<RecomendacionesResponse> {
    const instruccion =
      'Sos un asesor experto. Analiza este perfil y devuelve 2 recomendaciones cortas. Tu respuesta debe ser ÚNICAMENTE un JSON válido con esta estructura: { "recomendaciones": ["rec1", "rec2"] }';

    const prompt = `Datos del perfil en JSON:\n${JSON.stringify(datos, null, 2)}\n\n${instruccion}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const contenido = completion.choices[0]?.message?.content;

      if (!contenido) {
        throw new Error("La respuesta de Groq llegó vacía");
      }

      return JSON.parse(contenido) as RecomendacionesResponse;
    } catch (error) {
      this.logger.error("Falló la API de Groq al generar recomendaciones");

      if (error instanceof Error) {
        this.logger.error(error.message);
      }

      throw new InternalServerErrorException(
        "No se pudieron generar recomendaciones con IA",
      );
    }
  }
}
