import "reflect-metadata";
import axios from "axios";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import {
  IsNull,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Or,
  Repository,
} from "typeorm";
import AppDataSource from "../database/data-source";
import { ApiKey } from "../modules/clientes/entities/api-key.entity";
import { Cliente } from "../modules/clientes/entities/cliente.entity";
import { BcraDeudorDto } from "../modules/external-apis/bcra/dto/bcra-deudor.dto";
import { Persona } from "../modules/external-apis/entities/persona.entity";
import { PoliticaCrediticia } from "../modules/politica-crediticia/entities/politica-crediticia.entity";
import { Recomendacion } from "../modules/motor-reglas/entities/recomendacion.entity";
import { TipoProducto } from "../modules/productos/enums/tipo-producto.enum";
import { Producto } from "../modules/productos/entities/producto.entity";
import { ClienteSuscripcion } from "../modules/suscripciones/entities/cliente-suscripcion.entity";
import { RegistroUso } from "../modules/suscripciones/entities/registro-uso.entity";
import { TipoSuscripcion } from "../modules/suscripciones/enums/tipo-suscripcion.enum";
import { Usuario } from "../modules/usuarios/entities/usuario.entity";

type OrigenNombre = "persona_local" | "bcra_api" | "random";

interface ProductoSeed {
  tipo: TipoProducto;
  nombre: string;
  activo: boolean;
  tasaMin: number | null;
  tasaMax: number | null;
  montoMin: number | null;
  montoMax: number | null;
  cuotasMin: number | null;
  cuotasMax: number | null;
  limiteCuotasMin: number | null;
  limiteCuotasMax: number | null;
  limiteMontoTotalMin: number | null;
  limiteMontoTotalMax: number | null;
  interesMin: number | null;
  interesMax: number | null;
}

const DEFAULT_CUILS = [
  "20200000995",
  "20200009550",
  "27200046906",
  "23200077024",
  "27200095974",
  "20200100299",
  "20200102534",
  "27200057347",
];

const DEFAULT_CLIENT_NAME = "Fintech Demo Hackathon SA";
const DEFAULT_CLIENT_EMAIL = "demo.hackathon@presti.local";
const DEFAULT_CLIENT_PASSWORD = "Hackaton2026!";

const PRODUCTOS_SEED: ProductoSeed[] = [
  {
    tipo: TipoProducto.PRESTAMO,
    nombre: "Prestamo Personal",
    activo: true,
    tasaMin: 35,
    tasaMax: 75,
    montoMin: 200000,
    montoMax: 3000000,
    cuotasMin: 6,
    cuotasMax: 48,
    limiteCuotasMin: null,
    limiteCuotasMax: null,
    limiteMontoTotalMin: null,
    limiteMontoTotalMax: null,
    interesMin: null,
    interesMax: null,
  },
  {
    tipo: TipoProducto.MICROPRESTAMO,
    nombre: "Microprestamo Express",
    activo: true,
    tasaMin: 45,
    tasaMax: 95,
    montoMin: 50000,
    montoMax: 500000,
    cuotasMin: 1,
    cuotasMax: 18,
    limiteCuotasMin: null,
    limiteCuotasMax: null,
    limiteMontoTotalMin: null,
    limiteMontoTotalMax: null,
    interesMin: null,
    interesMax: null,
  },
  {
    tipo: TipoProducto.TARJETA_CREDITO,
    nombre: "Tarjeta de Credito Presti",
    activo: true,
    tasaMin: null,
    tasaMax: null,
    montoMin: null,
    montoMax: null,
    cuotasMin: null,
    cuotasMax: null,
    limiteCuotasMin: 1,
    limiteCuotasMax: 12,
    limiteMontoTotalMin: 150000,
    limiteMontoTotalMax: 2500000,
    interesMin: 60,
    interesMax: 140,
  },
];

function obtenerArgumento(nombre: string): string | undefined {
  const prefijo = `--${nombre}=`;
  const arg = process.argv.find((value) => value.startsWith(prefijo));
  return arg ? arg.slice(prefijo.length) : undefined;
}

function parsearCuils(raw?: string): {
  validos: string[];
  invalidos: string[];
} {
  const fuente = raw ?? DEFAULT_CUILS.join(",");
  const tokens = fuente
    .split(/[\s,;]+/)
    .map((value) => value.replace(/\D/g, ""))
    .filter(Boolean);

  const validos = new Set<string>();
  const invalidos: string[] = [];

  for (const token of tokens) {
    if (token.length === 11) {
      validos.add(token);
    } else {
      invalidos.push(token);
    }
  }

  return { validos: Array.from(validos), invalidos };
}

function hashTexto(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function capitalizarNombre(nombre: string): string {
  return nombre
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((segmento) => segmento.charAt(0).toUpperCase() + segmento.slice(1))
    .join(" ");
}

function generarNombreRandom(cuil: string): string {
  const nombres = [
    "Juan",
    "Maria",
    "Lucia",
    "Martin",
    "Sofia",
    "Agustin",
    "Camila",
    "Nicolas",
    "Florencia",
    "Tomas",
  ];
  const apellidos = [
    "Perez",
    "Gomez",
    "Lopez",
    "Fernandez",
    "Rodriguez",
    "Garcia",
    "Martinez",
    "Gonzalez",
    "Romero",
    "Diaz",
  ];

  const hash = hashTexto(cuil);
  const nombre = nombres[hash % nombres.length];
  const apellido =
    apellidos[Math.floor(hash / nombres.length) % apellidos.length];
  return `${nombre} ${apellido}`;
}

function generarFechaNacimientoRandom(cuil: string): Date {
  const hash = hashTexto(cuil);
  const year = 1980 + (hash % 24);
  const month = Math.floor(hash / 24) % 12;
  const day = (Math.floor(hash / (24 * 12)) % 28) + 1;
  return new Date(Date.UTC(year, month, day, 12, 0, 0));
}

async function buscarNombreEnBcra(
  cuil: string,
  bcraBaseUrl: string,
): Promise<string | null> {
  const baseUrl = bcraBaseUrl.endsWith("/")
    ? bcraBaseUrl.slice(0, -1)
    : bcraBaseUrl;

  try {
    const { data } = await axios.get<BcraDeudorDto>(
      `${baseUrl}/centraldedeudores/v1.0/Deudas/${cuil}`,
      { timeout: 8000 },
    );

    const denominacion = data?.results?.denominacion?.trim();
    if (!denominacion) return null;
    return capitalizarNombre(denominacion);
  } catch {
    return null;
  }
}

async function resolverNombreUsuario(
  cuil: string,
  personaRepository: Repository<Persona>,
  bcraBaseUrl: string,
): Promise<{ nombre: string; origen: OrigenNombre }> {
  const identificacion = Number(cuil);

  if (!Number.isNaN(identificacion)) {
    const persona = await personaRepository.findOne({
      where: { identificacion },
    });

    if (persona?.denominacion) {
      return {
        nombre: capitalizarNombre(persona.denominacion),
        origen: "persona_local",
      };
    }
  }

  const nombreBcra = await buscarNombreEnBcra(cuil, bcraBaseUrl);
  if (nombreBcra) {
    return { nombre: nombreBcra, origen: "bcra_api" };
  }

  return {
    nombre: generarNombreRandom(cuil),
    origen: "random",
  };
}

async function asegurarCliente(
  clienteRepository: Repository<Cliente>,
): Promise<Cliente> {
  const nombre = process.env.SEED_CLIENT_NAME ?? DEFAULT_CLIENT_NAME;
  const email = process.env.SEED_CLIENT_EMAIL ?? DEFAULT_CLIENT_EMAIL;
  const passwordPlano =
    process.env.SEED_CLIENT_PASSWORD ?? DEFAULT_CLIENT_PASSWORD;
  const password = await bcrypt.hash(passwordPlano, 10);

  let cliente = await clienteRepository.findOne({ where: { email } });

  if (!cliente) {
    cliente = await clienteRepository.findOne({ where: { nombre } });
  }

  if (!cliente) {
    cliente = clienteRepository.create({
      nombre,
      email,
      password,
    });
  } else {
    cliente.nombre = nombre;
    cliente.email = email;
    cliente.password = password;
  }

  return clienteRepository.save(cliente);
}

async function asegurarSuscripcionActiva(
  suscripcionRepository: Repository<ClienteSuscripcion>,
  clienteId: string,
): Promise<ClienteSuscripcion> {
  const ahora = new Date();

  const activa = await suscripcionRepository.findOne({
    where: {
      clienteId,
      startTimestamp: LessThanOrEqual(ahora),
      endTimestamp: Or(IsNull(), MoreThanOrEqual(ahora)),
    },
    order: { startTimestamp: "DESC" },
  });

  if (activa) {
    return activa;
  }

  const suscripcion = suscripcionRepository.create({
    clienteId,
    tipo: TipoSuscripcion.BUSINESS,
    startTimestamp: ahora,
    endTimestamp: null,
  });

  return suscripcionRepository.save(suscripcion);
}

async function asegurarApiKeyActiva(
  apiKeyRepository: Repository<ApiKey>,
  clienteId: string,
): Promise<ApiKey> {
  const existente = await apiKeyRepository.findOne({
    where: { clienteId, activo: true },
  });

  if (existente) {
    return existente;
  }

  const apiKey = apiKeyRepository.create({
    api_key: randomUUID(),
    clienteId,
    activo: true,
  });

  return apiKeyRepository.save(apiKey);
}

async function asegurarProductos(
  productoRepository: Repository<Producto>,
  clienteId: string,
): Promise<{
  productosPorTipo: Record<TipoProducto, Producto>;
  creados: number;
  actualizados: number;
}> {
  const productosPorTipo = {} as Record<TipoProducto, Producto>;
  let creados = 0;
  let actualizados = 0;

  for (const seed of PRODUCTOS_SEED) {
    let producto = await productoRepository.findOne({
      where: { clienteId, tipo: seed.tipo },
    });

    if (!producto) {
      producto = productoRepository.create({
        ...seed,
        clienteId,
      });
      creados += 1;
    } else {
      Object.assign(producto, seed);
      actualizados += 1;
    }

    const saved = await productoRepository.save(producto);
    productosPorTipo[saved.tipo] = saved;
  }

  return { productosPorTipo, creados, actualizados };
}

async function asegurarPoliticaCrediticia(
  politicaRepository: Repository<PoliticaCrediticia>,
  clienteId: string,
): Promise<void> {
  const existe = await politicaRepository.findOne({
    where: { cliente: { id: clienteId } },
  });
  if (!existe) {
    await politicaRepository.save(
      politicaRepository.create({ cliente: { id: clienteId } }),
    );
  }
}

async function asegurarUsuarios(
  usuarioRepository: Repository<Usuario>,
  personaRepository: Repository<Persona>,
  clienteId: string,
  cuils: string[],
  bcraBaseUrl: string,
): Promise<{
  creados: number;
  actualizados: number;
  omitidosPorOtroCliente: number;
  origenNombres: Record<OrigenNombre, number>;
}> {
  let creados = 0;
  let actualizados = 0;
  let omitidosPorOtroCliente = 0;

  const origenNombres: Record<OrigenNombre, number> = {
    persona_local: 0,
    bcra_api: 0,
    random: 0,
  };

  for (const cuil of cuils) {
    const existente = await usuarioRepository.findOne({
      where: { cuil },
      relations: ["cliente"],
    });

    if (existente && existente.cliente?.id !== clienteId) {
      omitidosPorOtroCliente += 1;
      continue;
    }

    const { nombre, origen } = await resolverNombreUsuario(
      cuil,
      personaRepository,
      bcraBaseUrl,
    );
    origenNombres[origen] += 1;

    if (!existente) {
      const usuario = usuarioRepository.create({
        cuil,
        nombre,
        cliente: { id: clienteId },
      });
      await usuarioRepository.save(usuario);
      creados += 1;
      continue;
    }

    existente.nombre = nombre;
    await usuarioRepository.save(existente);
    actualizados += 1;
  }

  return { creados, actualizados, omitidosPorOtroCliente, origenNombres };
}

async function asegurarUsoHoy(
  registroUsoRepository: Repository<RegistroUso>,
  clienteId: string,
  consultasObjetivo: number,
): Promise<{ consultasAntes: number; consultasDespues: number }> {
  const fechaHoy = new Date().toISOString().split("T")[0];
  let registro = await registroUsoRepository.findOne({
    where: { clienteId, fecha: fechaHoy },
  });

  const consultasAntes = registro?.consultasRecomendaciones ?? 0;
  const consultasDespues = Math.max(consultasAntes, consultasObjetivo);

  if (!registro) {
    registro = registroUsoRepository.create({
      clienteId,
      fecha: fechaHoy,
      consultasRecomendaciones: consultasDespues,
    });
  } else {
    registro.consultasRecomendaciones = consultasDespues;
  }

  await registroUsoRepository.save(registro);

  return { consultasAntes, consultasDespues };
}

async function asegurarRecomendacionesDemo(
  recomendacionRepository: Repository<Recomendacion>,
  usuarioRepository: Repository<Usuario>,
  clienteId: string,
  productosPorTipo: Record<TipoProducto, Producto>,
): Promise<{
  creadas: number;
  aprobadasForzadas: number;
  totalUltimos30Dias: number;
  aprobadas: number;
  rechazadas: number;
  pendientes: number;
}> {
  const usuarios = await usuarioRepository.find({
    where: { cliente: { id: clienteId } },
    order: { cuil: "ASC" },
  });
  const productos = Object.values(productosPorTipo);

  if (usuarios.length === 0 || productos.length === 0) {
    return {
      creadas: 0,
      aprobadasForzadas: 0,
      totalUltimos30Dias: 0,
      aprobadas: 0,
      rechazadas: 0,
      pendientes: 0,
    };
  }

  const desde = new Date();
  desde.setDate(desde.getDate() - 30);

  const recomendacionesExistentes = await recomendacionRepository.find({
    where: {
      cliente: { id: clienteId },
      timestamp: MoreThan(desde),
    },
    relations: ["usuario", "producto"],
    order: { timestamp: "DESC" },
  });

  const objetivoMinimo = 24;
  const faltantes = Math.max(objetivoMinimo - recomendacionesExistentes.length, 0);
  const nuevas: Recomendacion[] = [];

  for (let i = 0; i < faltantes; i += 1) {
    const usuario = usuarios[i % usuarios.length];
    const producto = productos[(i + Math.floor(i / usuarios.length)) % productos.length];

    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - (i % 14));
    timestamp.setHours(8 + (i % 10), (i * 13) % 60, 0, 0);

    let exito: boolean | null;
    const bucket = i % 10;
    if (bucket <= 5) {
      exito = true;
    } else if (bucket <= 7) {
      exito = false;
    } else {
      exito = null;
    }

    nuevas.push(
      recomendacionRepository.create({
        timestamp,
        exito,
        cliente: { id: clienteId },
        usuario: { cuil: usuario.cuil },
        producto: { id: producto.id },
      }),
    );
  }

  if (nuevas.length > 0) {
    await recomendacionRepository.save(nuevas);
  }

  let aprobadasForzadas = 0;
  const recomendacionesVentana = [...recomendacionesExistentes, ...nuevas];
  const tieneAprobadas = recomendacionesVentana.some(
    (recomendacion) => recomendacion.exito === true,
  );

  if (!tieneAprobadas && recomendacionesVentana.length > 0) {
    const forzarAprobadas = recomendacionesVentana.slice(
      0,
      Math.min(3, recomendacionesVentana.length),
    );

    for (const recomendacion of forzarAprobadas) {
      if (recomendacion.exito !== true) {
        recomendacion.exito = true;
        aprobadasForzadas += 1;
      }
    }

    if (aprobadasForzadas > 0) {
      await recomendacionRepository.save(forzarAprobadas);
    }
  }

  const recomendacionesFinales =
    aprobadasForzadas > 0
      ? await recomendacionRepository.find({
          where: {
            cliente: { id: clienteId },
            timestamp: MoreThan(desde),
          },
        })
      : recomendacionesVentana;

  const aprobadas = recomendacionesFinales.filter(
    (recomendacion) => recomendacion.exito === true,
  ).length;
  const rechazadas = recomendacionesFinales.filter(
    (recomendacion) => recomendacion.exito === false,
  ).length;
  const pendientes = recomendacionesFinales.filter(
    (recomendacion) => recomendacion.exito === null,
  ).length;

  return {
    creadas: nuevas.length,
    aprobadasForzadas,
    totalUltimos30Dias: recomendacionesFinales.length,
    aprobadas,
    rechazadas,
    pendientes,
  };
}

async function main(): Promise<void> {
  const { validos: cuils, invalidos } = parsearCuils(obtenerArgumento("cuils"));

  if (cuils.length === 0) {
    throw new Error("No hay CUILs validos para procesar");
  }

  if (invalidos.length > 0) {
    console.warn("CUILs invalidos omitidos:", invalidos.join(", "));
  }

  const bcraBaseUrl =
    process.env.BCRA_BASE_URL?.trim() || "https://api.bcra.gob.ar";

  console.log("Iniciando seed demo...");
  console.log(`CUILs a procesar: ${cuils.length}`);

  await AppDataSource.initialize();

  try {
    const clienteRepository = AppDataSource.getRepository(Cliente);
    const usuarioRepository = AppDataSource.getRepository(Usuario);
    const personaRepository = AppDataSource.getRepository(Persona);
    const productoRepository = AppDataSource.getRepository(Producto);
    const politicaRepository = AppDataSource.getRepository(PoliticaCrediticia);
    const suscripcionRepository =
      AppDataSource.getRepository(ClienteSuscripcion);
    const registroUsoRepository = AppDataSource.getRepository(RegistroUso);
    const recomendacionRepository = AppDataSource.getRepository(Recomendacion);
    const apiKeyRepository = AppDataSource.getRepository(ApiKey);

    const cliente = await asegurarCliente(clienteRepository);
    const suscripcion = await asegurarSuscripcionActiva(
      suscripcionRepository,
      cliente.id,
    );
    const apiKey = await asegurarApiKeyActiva(apiKeyRepository, cliente.id);

    await asegurarPoliticaCrediticia(politicaRepository, cliente.id);
    const productos = await asegurarProductos(productoRepository, cliente.id);
    const usuarios = await asegurarUsuarios(
      usuarioRepository,
      personaRepository,
      cliente.id,
      cuils,
      bcraBaseUrl,
    );
    const recomendaciones = await asegurarRecomendacionesDemo(
      recomendacionRepository,
      usuarioRepository,
      cliente.id,
      productos.productosPorTipo,
    );
    const usoHoy = await asegurarUsoHoy(registroUsoRepository, cliente.id, 42);

    const passwordPlano =
      process.env.SEED_CLIENT_PASSWORD ?? DEFAULT_CLIENT_PASSWORD;

    console.log("Seed completado.");
    console.log("--- RESUMEN ---");
    console.log(`Cliente ID: ${cliente.id}`);
    console.log(`Cliente Email: ${cliente.email}`);
    console.log(`Cliente Password: ${passwordPlano}`);
    console.log(`Suscripcion activa: ${suscripcion.tipo}`);
    console.log(`API Key activa: ${apiKey.api_key}`);
    console.log(
      `Productos -> creados: ${productos.creados}, actualizados: ${productos.actualizados}`,
    );
    console.log(
      `Usuarios -> creados: ${usuarios.creados}, actualizados: ${usuarios.actualizados}, omitidos por otro cliente: ${usuarios.omitidosPorOtroCliente}`,
    );
    console.log(
      `Recomendaciones (ultimos 30 dias) -> creadas: ${recomendaciones.creadas}, total: ${recomendaciones.totalUltimos30Dias}, aprobadas: ${recomendaciones.aprobadas}, rechazadas: ${recomendaciones.rechazadas}, pendientes: ${recomendaciones.pendientes}`,
    );
    console.log(
      `Aprobadas forzadas para evitar tasa 0%: ${recomendaciones.aprobadasForzadas}`,
    );
    console.log(
      `Uso hoy -> consultas antes: ${usoHoy.consultasAntes}, consultas despues: ${usoHoy.consultasDespues}`,
    );
    console.log(
      `Origen de nombres -> persona local: ${usuarios.origenNombres.persona_local}, bcra api: ${usuarios.origenNombres.bcra_api}, random: ${usuarios.origenNombres.random}`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error ejecutando seed demo:", error);
    process.exit(1);
  });
