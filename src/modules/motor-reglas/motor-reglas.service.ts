import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CarteraService } from "../cartera/cartera.service";
import { BcraService } from "../external-apis/bcra/bcra.service";
import { PoliticaCrediticiaService } from "../politica-crediticia/politica-crediticia.service";
import { Producto } from "../productos/entities/producto.entity";
import { Usuario } from "../usuarios/entities/usuario.entity";
import { CreateRecomendacionDto } from "./dto/create-recomendacion.dto";
import { UpdateRecomendacionDto } from "./dto/update-recomendacion.dto";
import { Recomendacion } from "./entities/recomendacion.entity";
import { GroqRecomendacionesService } from "./groq-recomendaciones.service";

type RecomendacionListItem = {
  id: string;
  cuil: string | null;
  usuarioCuil: string | null;
  usuarioNombre: string | null;
  nombre: string | null;
  producto: Producto | null;
  productoNombre: string | null;
  estado: "Aprobado" | "Rechazado" | "Pendiente";
  exito: boolean | null;
  createdAt: Date;
};

@Injectable()
export class MotorReglasService {
  constructor(
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly bcraService: BcraService,
    private readonly carteraService: CarteraService,
    private readonly politicaCrediticiaService: PoliticaCrediticiaService,
    private readonly groqService: GroqRecomendacionesService,
  ) {}

  // ── Recomendaciones ───────────────────────────────────────────────────────

  async findAllRecomendaciones(
    clienteId: string,
    desde: string,
    cuil?: string,
  ): Promise<RecomendacionListItem[]> {
    const query = this.recomendacionRepository
      .createQueryBuilder("recomendacion")
      .leftJoinAndSelect("recomendacion.producto", "producto")
      .leftJoinAndSelect("recomendacion.usuario", "usuario")
      .leftJoin("recomendacion.cliente", "cliente")
      .where("cliente.id = :clienteId", { clienteId })
      .andWhere("recomendacion.timestamp > :desde", {
        desde: new Date(desde),
      });

    const cuilNormalizado = cuil?.trim();
    if (cuilNormalizado) {
      query.andWhere("usuario.cuil = :cuil", { cuil: cuilNormalizado });
    }

    const recomendaciones = await query
      .orderBy("recomendacion.timestamp", "DESC")
      .getMany();

    return recomendaciones.map((recomendacion) => {
      const usuarioCuil = recomendacion.usuario?.cuil ?? null;
      const usuarioNombre = recomendacion.usuario?.nombre ?? usuarioCuil;

      return {
        id: recomendacion.id,
        cuil: usuarioCuil,
        usuarioCuil,
        usuarioNombre,
        nombre: usuarioNombre,
        producto: recomendacion.producto ?? null,
        productoNombre: recomendacion.producto?.nombre ?? null,
        estado: this.obtenerEstadoRecomendacion(recomendacion.exito),
        exito: recomendacion.exito,
        createdAt: recomendacion.timestamp,
      };
    });
  }

  async findOneRecomendacion(
    id: string,
    clienteId: string,
  ): Promise<Recomendacion> {
    const rec = await this.recomendacionRepository.findOne({
      where: { id, cliente: { id: clienteId } },
      relations: ["usuario", "producto"],
    });
    if (!rec) throw new NotFoundException(`Recomendacion ${id} no encontrada`);
    return rec;
  }

  async updateRecomendacion(
    id: string,
    dto: UpdateRecomendacionDto,
    clienteId: string,
  ): Promise<Recomendacion> {
    const rec = await this.findOneRecomendacion(id, clienteId);
    rec.exito = dto.exito;
    return this.recomendacionRepository.save(rec);
  }

  async createRecomendacion(
    dto: CreateRecomendacionDto,
    clienteId: string,
  ): Promise<void> {
    // ── Paso 1: Consultar BCRA y persistir datos públicos ───────────────────
    const bcraData = await this.bcraService.fetchAndPersist(dto.cuil);

    // ── Paso 1.5: Registrar consulta en cartera privada ──────────────────────
    await this.carteraService.registrarConsulta(clienteId, dto.cuil, bcraData);

    // ── Paso 2: Upsert usuario ───────────────────────────────────────────────
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: { cuil: dto.cuil },
    });

    if (!usuarioExistente) {
      const nombre = bcraData?.denominacion ?? dto.cuil;
      await this.usuarioRepository.save(
        this.usuarioRepository.create({
          cuil: dto.cuil,
          nombre: nombre.slice(0, 100),
          cliente: { id: clienteId },
        }),
      );
    }

    // ── Paso 3: Evaluar política crediticia ──────────────────────────────────
    const politica = await this.politicaCrediticiaService.findByCliente(clienteId);
    if (!this.politicaCrediticiaService.evaluarPerfil(politica, bcraData)) return;

    // ── Paso 4: Productos activos del cliente ────────────────────────────────
    const productos = await this.productoRepository.find({
      where: { clienteId, activo: true },
    });

    if (productos.length === 0) return;

    // ── Paso 5: IA recomienda productos en base a perfil BCRA ────────────────
    const productoIds = await this.groqService.recomendarPorBcra(
      bcraData,
      productos,
    );

    // ── Paso 6: Crear recomendaciones ────────────────────────────────────────
    const ahora = new Date();
    for (const productoId of productoIds) {
      await this.recomendacionRepository.save(
        this.recomendacionRepository.create({
          timestamp: ahora,
          exito: null,
          cliente: { id: clienteId },
          usuario: { cuil: dto.cuil },
          producto: { id: productoId },
        }),
      );
    }
  }

  private obtenerEstadoRecomendacion(
    exito: boolean | null,
  ): "Aprobado" | "Rechazado" | "Pendiente" {
    if (exito === true) return "Aprobado";
    if (exito === false) return "Rechazado";
    return "Pendiente";
  }
}
