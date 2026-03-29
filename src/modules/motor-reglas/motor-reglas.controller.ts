import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentCliente } from "../auth/decorators/current-cliente.decorator";
import { Public } from "../auth/decorators/public.decorator";
import { JwtOrApiKeyAuthGuard } from "../auth/guards/jwt-or-api-key-auth.guard";
import { ConsultaLimitGuard } from "../suscripciones/guards/consulta-limit.guard";
import { CreateRecomendacionDto } from "./dto/create-recomendacion.dto";
import { ObtenerRecomendacionesDto } from "./dto/obtener-recomendaciones.dto";
import { UpdateRecomendacionDto } from "./dto/update-recomendacion.dto";
import { GroqRecomendacionesService } from "./groq-recomendaciones.service";
import { MotorReglasService } from "./motor-reglas.service";

@ApiBearerAuth()
@Controller()
export class MotorReglasController {
  constructor(
    private readonly motorReglasService: MotorReglasService,
    private readonly groqRecomendacionesService: GroqRecomendacionesService,
  ) {}

  // ── Recomendaciones ───────────────────────────────────────────────────────

  @ApiTags("Recomendaciones")
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Get("recomendaciones")
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({
    summary: "Listar recomendaciones creadas después de una timestamp (JWT o API Key)",
  })
  @ApiQuery({ name: "desde", required: true, description: "Timestamp ISO 8601. Devuelve recomendaciones creadas después de este momento." })
  @ApiQuery({
    name: "cuil",
    required: false,
    description: "CUIL del usuario (11 dígitos). Si se omite, lista todas las recomendaciones del cliente.",
  })
  findAllRecomendaciones(
    @CurrentCliente() clienteId: string,
    @Query("desde") desde: string,
    @Query("cuil") cuil?: string,
  ) {
    return this.motorReglasService.findAllRecomendaciones(clienteId, desde, cuil);
  }

  @ApiTags("Recomendaciones")
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Get("recomendaciones/:id")
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({ summary: "Obtener una recomendación (JWT o API Key)" })
  findOneRecomendacion(
    @Param("id") id: string,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.findOneRecomendacion(id, clienteId);
  }

  @ApiTags("Recomendaciones")
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard, ConsultaLimitGuard)
  @Post("recomendaciones")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({
    summary:
      "Evaluar perfil BCRA de un usuario y generar recomendaciones de productos con IA (JWT o API Key)",
  })
  createRecomendacion(
    @Body() dto: CreateRecomendacionDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.createRecomendacion(dto, clienteId);
  }

  @ApiTags("Recomendaciones")
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Patch("recomendaciones/:id")
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({
    summary: "Registrar si una recomendación tuvo éxito (JWT o API Key)",
  })
  updateRecomendacion(
    @Param("id") id: string,
    @Body() dto: UpdateRecomendacionDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.updateRecomendacion(id, dto, clienteId);
  }

  @ApiTags("Recomendaciones IA")
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Post("recomendaciones/ia")
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({
    summary: "Generar recomendaciones IA con perfil estandar (JWT o API Key)",
  })
  generarRecomendacionesIA(@Body() perfil: ObtenerRecomendacionesDto) {
    return this.groqRecomendacionesService.obtenerRecomendaciones(perfil);
  }

  @ApiTags("Recomendaciones IA")
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Post("recomendaciones/ia/personalizada")
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({
    summary:
      "Generar recomendaciones IA con JSON personalizado (JWT o API Key)",
  })
  @ApiBody({
    schema: {
      type: "object",
      additionalProperties: true,
      example: {
        edad: 25,
        salario: 1000000,
      },
    },
  })
  generarRecomendacionesPersonalizadas(
    @Body() payload: Record<string, unknown>,
  ) {
    return this.groqRecomendacionesService.obtenerRecomendacionesPersonalizadas(
      payload,
    );
  }
}
