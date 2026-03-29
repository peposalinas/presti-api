import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import OpenAI from "openai";
import { Producto } from "../productos/entities/producto.entity";
import { BcraProfileData } from "../external-apis/bcra/bcra.service";

type RecomendacionesResponse = {
  recomendaciones: string[];
};

type BcraRecomendacionesResponse = {
  recomendaciones: { productoId: string }[];
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

  /**
   * Analiza el perfil BCRA de un solicitante y recomienda productos financieros.
   * Retorna a lo sumo 1 producto por TipoProducto.
   */
  async recomendarPorBcra(
    bcraData: BcraProfileData | null,
    productos: Producto[],
  ): Promise<string[]> {
    if (productos.length === 0) return [];

    const productosResumen = productos.map((p) => ({
      productoId: p.id,
      nombre: p.nombre,
      tipo: p.tipo,
      tasaMin: p.tasaMin,
      tasaMax: p.tasaMax,
      montoMin: p.montoMin,
      montoMax: p.montoMax,
      cuotasMin: p.cuotasMin,
      cuotasMax: p.cuotasMax,
    }));

    const bcraResumen = bcraData
      ? {
          denominacion: bcraData.denominacion,
          deudas: bcraData.deudas?.periodos?.slice(0, 3) ?? [],
          historica: bcraData.historica?.periodos?.slice(0, 3) ?? [],
          chequesRechazados: bcraData.cheques?.causales?.length ?? 0,
        }
      : { sinDatosBCRA: true };

    const prompt = `Sos un analista de crédito experto para una fintech argentina.

DATOS BCRA DEL SOLICITANTE:
${JSON.stringify(bcraResumen, null, 2)}

PRODUCTOS FINANCIEROS DISPONIBLES:
${JSON.stringify(productosResumen, null, 2)}

INSTRUCCIONES:
- Analizá la situación crediticia del solicitante en base a los datos BCRA (deudas, situaciones, cheques rechazados).
- Por cada tipo de producto (PRESTAMO, MICROPRESTAMO, TARJETA_CREDITO), podés recomendar A LO SUMO 1 producto. Si ninguno es adecuado para ese tipo, no incluyas ninguno.
- Solo recomendá un producto si el perfil crediticio lo justifica claramente. Es preferible no recomendar que recomendar mal.
- Usá únicamente los productoId del JSON de productos disponibles.
- Respondé ÚNICAMENTE con este JSON válido, sin texto adicional:
{ "recomendaciones": [{ "productoId": "uuid-del-producto" }] }
- Si no corresponde recomendar ningún producto, respondé: { "recomendaciones": [] }`;

    try {
      const completion = await this.client.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const contenido = completion.choices[0]?.message?.content;
      if (!contenido) throw new Error("La respuesta de Groq llegó vacía");

      const respuesta = JSON.parse(contenido) as BcraRecomendacionesResponse;
      const ids = (respuesta.recomendaciones ?? [])
        .map((r) => r.productoId)
        .filter(Boolean);

      // Validar que los IDs devueltos por la IA correspondan a productos reales
      const productosIds = new Set(productos.map((p) => p.id));
      return ids.filter((id) => productosIds.has(id));
    } catch (error) {
      this.logger.error("Falló la API de Groq al generar recomendaciones BCRA");
      if (error instanceof Error) this.logger.error(error.message);
      throw new InternalServerErrorException(
        "No se pudieron generar recomendaciones con IA",
      );
    }
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
