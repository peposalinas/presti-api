import {
  Body,
  Controller,
  Delete,
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
import { CreateRecomendacionDto } from "./dto/create-recomendacion.dto";
import { CreateReglaDto } from "./dto/create-regla.dto";
import { ObtenerRecomendacionesDto } from "./dto/obtener-recomendaciones.dto";
import { UpdateRecomendacionDto } from "./dto/update-recomendacion.dto";
import { UpdateReglaDto } from "./dto/update-regla.dto";
import { GroqRecomendacionesService } from "./groq-recomendaciones.service";
import { MotorReglasService } from "./motor-reglas.service";

@ApiBearerAuth()
@Controller()
export class MotorReglasController {
  constructor(
    private readonly motorReglasService: MotorReglasService,
    private readonly groqRecomendacionesService: GroqRecomendacionesService,
  ) {}

  // ── Reglas ────────────────────────────────────────────────────────────────

  @ApiTags("Reglas")
  @Get("reglas")
  @ApiOperation({ summary: "Listar reglas ordenadas por prioridad" })
  findAllReglas(@CurrentCliente() clienteId: string) {
    return this.motorReglasService.findAllReglas(clienteId);
  }

  @ApiTags("Reglas")
  @Get("reglas/:id")
  @ApiOperation({ summary: "Obtener una regla" })
  findOneRegla(@Param("id") id: string, @CurrentCliente() clienteId: string) {
    return this.motorReglasService.findOneRegla(id, clienteId);
  }

  @ApiTags("Reglas")
  @Post("reglas")
  @ApiOperation({ summary: "Crear una regla para un producto" })
  createRegla(
    @Body() dto: CreateReglaDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.createRegla(dto, clienteId);
  }

  @ApiTags("Reglas")
  @Patch("reglas/:id")
  @ApiOperation({ summary: "Actualizar una regla" })
  updateRegla(
    @Param("id") id: string,
    @Body() dto: UpdateReglaDto,
    @CurrentCliente() clienteId: string,
  ) {
    return this.motorReglasService.updateRegla(id, dto, clienteId);
  }

  @ApiTags("Reglas")
  @Delete("reglas/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Eliminar una regla" })
  removeRegla(@Param("id") id: string, @CurrentCliente() clienteId: string) {
    return this.motorReglasService.removeRegla(id, clienteId);
  }

  // ── Recomendaciones ───────────────────────────────────────────────────────

  @ApiTags("Recomendaciones")
  @Public()
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Get("recomendaciones")
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({
    summary: "Listar recomendaciones con filtros opcionales (JWT o API Key)",
  })
  @ApiQuery({ name: "usuarioCuil", required: false })
  @ApiQuery({ name: "productoId", required: false })
  findAllRecomendaciones(
    @CurrentCliente() clienteId: string,
    @Query("usuarioCuil") usuarioCuil?: string,
    @Query("productoId") productoId?: string,
  ) {
    return this.motorReglasService.findAllRecomendaciones(clienteId, {
      usuarioCuil,
      productoId,
    });
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
  @UseGuards(JwtOrApiKeyAuthGuard)
  @Post("recomendaciones")
  @ApiBearerAuth()
  @ApiSecurity("x-api-key")
  @ApiOperation({
    summary:
      "Evaluar reglas para un usuario y generar recomendaciones de productos (JWT o API Key)",
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
        host: "aws-1-sa-east-1.pooler.supabase.com",
        port: 5432,
        database: "postgres",
        user: "postgres.nyiyfilbvjakagxpcvhs",
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
