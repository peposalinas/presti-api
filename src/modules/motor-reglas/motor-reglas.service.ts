import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BcraService } from '../external-apis/bcra/bcra.service';
import { Producto } from '../productos/entities/producto.entity';
import { SuscripcionesService } from '../suscripciones/suscripciones.service';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateRecomendacionDto } from './dto/create-recomendacion.dto';
import { CreateReglaDto } from './dto/create-regla.dto';
import { UpdateRecomendacionDto } from './dto/update-recomendacion.dto';
import { UpdateReglaDto } from './dto/update-regla.dto';
import { Recomendacion } from './entities/recomendacion.entity';
import { Regla } from './entities/regla.entity';
import { Operador } from './enums/operador.enum';
import { Parametro } from './enums/parametro.enum';
import { TipoValor } from './enums/tipo-valor.enum';

@Injectable()
export class MotorReglasService {
  constructor(
    @InjectRepository(Regla)
    private readonly reglaRepository: Repository<Regla>,
    @InjectRepository(Recomendacion)
    private readonly recomendacionRepository: Repository<Recomendacion>,
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly bcraService: BcraService,
    private readonly suscripcionesService: SuscripcionesService,
  ) {}

  // ── Reglas ────────────────────────────────────────────────────────────────

  findAllReglas(clienteId: string): Promise<Regla[]> {
    return this.reglaRepository.find({
      where: { clienteId },
      order: { prioridad: 'ASC' },
    });
  }

  async findOneRegla(id: string, clienteId: string): Promise<Regla> {
    const regla = await this.reglaRepository.findOne({
      where: { id, clienteId },
    });
    if (!regla) throw new NotFoundException(`Regla ${id} no encontrada`);
    return regla;
  }

  createRegla(dto: CreateReglaDto, clienteId: string): Promise<Regla> {
    const regla = this.reglaRepository.create({
      ...dto,
      productoId: dto.productoId ?? null,
      tipoProductoId: dto.tipoProductoId ?? null,
      clienteId,
    });
    return this.reglaRepository.save(regla);
  }

  async updateRegla(
    id: string,
    dto: UpdateReglaDto,
    clienteId: string,
  ): Promise<Regla> {
    const regla = await this.findOneRegla(id, clienteId);
    Object.assign(regla, dto);
    return this.reglaRepository.save(regla);
  }

  async removeRegla(id: string, clienteId: string): Promise<void> {
    const regla = await this.findOneRegla(id, clienteId);
    await this.reglaRepository.remove(regla);
  }

  // ── Recomendaciones ───────────────────────────────────────────────────────

  findAllRecomendaciones(
    clienteId: string,
    filters: { usuarioCuil?: string; productoId?: string; tipoProductoId?: string },
  ): Promise<Recomendacion[]> {
    const where: Record<string, unknown> = { cliente: { id: clienteId } };
    if (filters.usuarioCuil) where.usuario = { cuil: filters.usuarioCuil };
    if (filters.productoId) where.producto = { id: filters.productoId };
    if (filters.tipoProductoId)
      where.producto = { ...(where.producto as object ?? {}), tipoProducto: { id: filters.tipoProductoId } };

    return this.recomendacionRepository.find({
      where,
      relations: ['usuario', 'producto', 'producto.tipoProducto'],
      order: { timestamp: 'DESC' },
    });
  }

  async findOneRecomendacion(id: string, clienteId: string): Promise<Recomendacion> {
    const rec = await this.recomendacionRepository.findOne({
      where: { id, cliente: { id: clienteId } },
      relations: ['usuario', 'producto', 'producto.tipoProducto'],
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
  ): Promise<Recomendacion[]> {
    await this.suscripcionesService.verificarYRegistrarConsulta(clienteId);

    // ── Paso 1: Upsert Usuario ───────────────────────────────────────────────
    let usuario = await this.usuarioRepository.findOne({
      where: { cuil: dto.cuil },
    });

    if (!usuario) {
      usuario = this.usuarioRepository.create({
        cuil: dto.cuil,
        nombre: dto.nombre,
        fechaNacimiento: new Date(dto.fechaNacimiento),
        cliente: { id: clienteId },
      });
      await this.usuarioRepository.save(usuario);
    } else if (dto.update) {
      usuario.nombre = dto.nombre;
      usuario.fechaNacimiento = new Date(dto.fechaNacimiento);
      await this.usuarioRepository.save(usuario);
    }

    // ── Paso 2: Datos para evaluación ────────────────────────────────────────
    const edad = this.calcularEdad(new Date(dto.fechaNacimiento));

    let situacionBcra: number | null = null;
    try {
      const bcraData = await this.bcraService.getDeudoresPorCuit(dto.cuil);
      situacionBcra = this.extraerSituacionBcra(bcraData);
    } catch {
      // Si el CUIL no tiene deudas en BCRA o el servicio falla, se omite
      situacionBcra = null;
    }

    const contexto: Partial<Record<Parametro, number | null>> = {
      [Parametro.EDAD]: edad,
      [Parametro.SITUACION_BCRA]: situacionBcra,
      // TODO: integrar con modelo de IA para los siguientes parámetros
      [Parametro.SCORE_CREDITICIO]: null,
      [Parametro.MONTO_SOLICITADO]: null,
      [Parametro.PLAZO_SOLICITADO]: null,
      [Parametro.INGRESOS]: null,
    };

    // ── Paso 3: Productos activos del cliente ────────────────────────────────
    const productos = await this.productoRepository.find({
      where: { clienteId, activo: true },
    });

    // ── Paso 4: Reglas del cliente ───────────────────────────────────────────
    const reglas = await this.reglaRepository.find({ where: { clienteId } });

    // ── Paso 5: Evaluar por producto y crear recomendaciones ─────────────────
    const recomendaciones: Recomendacion[] = [];

    for (const producto of productos) {
      const reglasAplicables = reglas.filter(
        (r) =>
          r.productoId === producto.id ||
          (r.tipoProductoId !== null && r.tipoProductoId === producto.tipoProductoId),
      );

      const cumpleTodasLasReglas = reglasAplicables.every((regla) => {
        const valorContexto = contexto[regla.parametro];
        if (valorContexto === null || valorContexto === undefined) {
          // Parámetro sin dato disponible: omitir regla (no bloquea)
          return true;
        }
        return this.evaluarRegla(regla, valorContexto);
      });

      if (cumpleTodasLasReglas) {
        const rec = this.recomendacionRepository.create({
          timestamp: new Date(),
          exito: false,
          cliente: { id: clienteId },
          usuario: { cuil: dto.cuil },
          producto: { id: producto.id },
        });
        recomendaciones.push(await this.recomendacionRepository.save(rec));
      }
    }

    return recomendaciones;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesActual = hoy.getMonth() - fechaNacimiento.getMonth();
    if (mesActual < 0 || (mesActual === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  private extraerSituacionBcra(bcraData: Awaited<ReturnType<BcraService['getDeudoresPorCuit']>>): number | null {
    const periodos = bcraData?.results?.periodos;
    if (!periodos || periodos.length === 0) return null;

    // Período más reciente (ordenado desc por período YYYY-MM)
    const ultimoPeriodo = periodos.sort((a, b) => b.periodo.localeCompare(a.periodo))[0];
    if (!ultimoPeriodo.entidades || ultimoPeriodo.entidades.length === 0) return null;

    // Peor situación (valor más alto) entre todas las entidades del período
    return Math.max(...ultimoPeriodo.entidades.map((e) => e.situacion));
  }

  private evaluarRegla(regla: Regla, valor: number): boolean {
    const umbral = this.parsearValor(regla.valor, regla.tipoValor);
    if (umbral === null) return true;

    switch (regla.operador) {
      case Operador.IGUAL:          return valor === umbral;
      case Operador.DISTINTO:       return valor !== umbral;
      case Operador.MAYOR_QUE:      return valor > umbral;
      case Operador.MENOR_QUE:      return valor < umbral;
      case Operador.MAYOR_O_IGUAL:  return valor >= umbral;
      case Operador.MENOR_O_IGUAL:  return valor <= umbral;
    }
  }

  private parsearValor(valor: string, tipoValor: TipoValor): number | null {
    switch (tipoValor) {
      case TipoValor.NUMERO:   return Number(valor);
      case TipoValor.BOOLEANO: return valor === 'true' ? 1 : 0;
      case TipoValor.FECHA:    return new Date(valor).getTime();
      case TipoValor.TEXTO:    return null; // comparaciones de texto no soportadas aún
    }
  }
}
