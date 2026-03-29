/**
 * Seed de datos privados para demo.
 * Puebla únicamente las tablas privadas (NO las tablas BCRA públicas):
 *   - usuarios         → 32 nuevos ficticios para llegar a ~40 totales
 *   - recomendaciones  → actualiza exito en existentes + crea nuevas para 20 usuarios
 *   - consultas_usuario → upsert para los 40 CUILs con situaciones variadas
 *   - cambios_situacion → 14 nuevos cambios (8 empeoran, 6 mejoran)
 *
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/seed-privado.ts
 */

import "reflect-metadata";
import { IsNull, Repository } from "typeorm";
import AppDataSource from "../database/data-source";
import { CambioSituacion } from "../modules/cartera/entities/cambio-situacion.entity";
import { ConsultaUsuario } from "../modules/cartera/entities/consulta-usuario.entity";
import { Cliente } from "../modules/clientes/entities/cliente.entity";
import { Recomendacion } from "../modules/motor-reglas/entities/recomendacion.entity";
import { Producto } from "../modules/productos/entities/producto.entity";
import { Usuario } from "../modules/usuarios/entities/usuario.entity";

const DEMO_EMAIL = "demo.hackathon@presti.local";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularCuil(prefix: 20 | 23 | 27, dni: number): string {
  const base = `${prefix}${String(dni).padStart(8, "0")}`;
  const digits = base.split("").map(Number);
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const rem = sum % 11;
  const ver = rem === 0 ? 0 : rem === 1 ? (prefix === 27 ? 4 : 9) : 11 - rem;
  return `${base}${ver}`;
}

function diasAtras(dias: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d;
}

// ─── Usuarios ficticios nuevos (32) ──────────────────────────────────────────

interface UsuarioSeed {
  cuil: string;
  nombre: string;
}

const USUARIOS_NUEVOS: UsuarioSeed[] = [
  { cuil: calcularCuil(20, 25341234), nombre: "Martín Álvarez" },
  { cuil: calcularCuil(27, 30345678), nombre: "Sofía Benítez" },
  { cuil: calcularCuil(20, 27890123), nombre: "Lucas Cabrera" },
  { cuil: calcularCuil(27, 33456789), nombre: "Valentina Díaz" },
  { cuil: calcularCuil(20, 28901234), nombre: "Facundo Estrada" },
  { cuil: calcularCuil(27, 34567890), nombre: "Florencia Ferreyra" },
  { cuil: calcularCuil(20, 29012345), nombre: "Agustín García" },
  { cuil: calcularCuil(27, 35678901), nombre: "Natalia Herrera" },
  { cuil: calcularCuil(20, 31123456), nombre: "Diego Ibáñez" },
  { cuil: calcularCuil(27, 36789012), nombre: "Camila Juárez" },
  { cuil: calcularCuil(20, 32234567), nombre: "Alejandro López" },
  { cuil: calcularCuil(27, 37890123), nombre: "Graciela Medina" },
  { cuil: calcularCuil(20, 26789012), nombre: "Ezequiel Martínez" },
  { cuil: calcularCuil(27, 38901234), nombre: "Patricia Noriega" },
  { cuil: calcularCuil(20, 27456789), nombre: "Nicolás Ortega" },
  { cuil: calcularCuil(27, 39012345), nombre: "Verónica Peralta" },
  { cuil: calcularCuil(20, 30678901), nombre: "Gonzalo Quiroga" },
  { cuil: calcularCuil(27, 40123456), nombre: "Daniela Ríos" },
  { cuil: calcularCuil(20, 31789012), nombre: "Roberto Sánchez" },
  { cuil: calcularCuil(27, 41234567), nombre: "Cecilia Torres" },
  { cuil: calcularCuil(20, 32890123), nombre: "Adrián Urquiza" },
  { cuil: calcularCuil(27, 42345678), nombre: "Mariana Vega" },
  { cuil: calcularCuil(20, 33901234), nombre: "Claudio Wolff" },
  { cuil: calcularCuil(27, 43456789), nombre: "Silvina Yáñez" },
  { cuil: calcularCuil(20, 25678901), nombre: "Fernando Zabala" },
  { cuil: calcularCuil(27, 28345678), nombre: "Lorena Acosta" },
  { cuil: calcularCuil(20, 29567890), nombre: "Cristian Bravo" },
  { cuil: calcularCuil(27, 31890123), nombre: "Andrea Castro" },
  { cuil: calcularCuil(20, 33123456), nombre: "Pablo Domínguez" },
  { cuil: calcularCuil(27, 34901234), nombre: "Romina Figueroa" },
  { cuil: calcularCuil(20, 36234567), nombre: "Luciano Gutiérrez" },
  { cuil: calcularCuil(27, 37567890), nombre: "Luciana Roldán" },
];

// ─── Cartera: situacion y cambios para los 32 nuevos ─────────────────────────

interface DatoCartera {
  cuil: string;
  situacion: number;
  cambio?: { anterior: number; nueva: number; diasAtras: number };
}

const DATOS_CARTERA: DatoCartera[] = [
  // ── Mejoran (6) ──
  { cuil: USUARIOS_NUEVOS[0].cuil,  situacion: 1, cambio: { anterior: 3, nueva: 1, diasAtras: 4  } },
  { cuil: USUARIOS_NUEVOS[2].cuil,  situacion: 1, cambio: { anterior: 2, nueva: 1, diasAtras: 9  } },
  { cuil: USUARIOS_NUEVOS[6].cuil,  situacion: 2, cambio: { anterior: 4, nueva: 2, diasAtras: 14 } },
  { cuil: USUARIOS_NUEVOS[10].cuil, situacion: 1, cambio: { anterior: 3, nueva: 1, diasAtras: 18 } },
  { cuil: USUARIOS_NUEVOS[14].cuil, situacion: 2, cambio: { anterior: 5, nueva: 2, diasAtras: 21 } },
  { cuil: USUARIOS_NUEVOS[20].cuil, situacion: 1, cambio: { anterior: 2, nueva: 1, diasAtras: 25 } },
  // ── Empeoran (8) ──
  { cuil: USUARIOS_NUEVOS[1].cuil,  situacion: 2, cambio: { anterior: 1, nueva: 2, diasAtras: 3  } },
  { cuil: USUARIOS_NUEVOS[4].cuil,  situacion: 3, cambio: { anterior: 1, nueva: 3, diasAtras: 6  } },
  { cuil: USUARIOS_NUEVOS[7].cuil,  situacion: 3, cambio: { anterior: 2, nueva: 3, diasAtras: 11 } },
  { cuil: USUARIOS_NUEVOS[11].cuil, situacion: 4, cambio: { anterior: 2, nueva: 4, diasAtras: 15 } },
  { cuil: USUARIOS_NUEVOS[16].cuil, situacion: 5, cambio: { anterior: 3, nueva: 5, diasAtras: 17 } },
  { cuil: USUARIOS_NUEVOS[22].cuil, situacion: 3, cambio: { anterior: 1, nueva: 3, diasAtras: 20 } },
  { cuil: USUARIOS_NUEVOS[26].cuil, situacion: 4, cambio: { anterior: 2, nueva: 4, diasAtras: 23 } },
  { cuil: USUARIOS_NUEVOS[30].cuil, situacion: 2, cambio: { anterior: 1, nueva: 2, diasAtras: 24 } },
  // ── Sin cambio (18 restantes) ──
  { cuil: USUARIOS_NUEVOS[3].cuil,  situacion: 1 },
  { cuil: USUARIOS_NUEVOS[5].cuil,  situacion: 2 },
  { cuil: USUARIOS_NUEVOS[8].cuil,  situacion: 1 },
  { cuil: USUARIOS_NUEVOS[9].cuil,  situacion: 1 },
  { cuil: USUARIOS_NUEVOS[12].cuil, situacion: 2 },
  { cuil: USUARIOS_NUEVOS[13].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[15].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[17].cuil, situacion: 3 },
  { cuil: USUARIOS_NUEVOS[18].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[19].cuil, situacion: 2 },
  { cuil: USUARIOS_NUEVOS[21].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[23].cuil, situacion: 4 },
  { cuil: USUARIOS_NUEVOS[24].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[25].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[27].cuil, situacion: 2 },
  { cuil: USUARIOS_NUEVOS[28].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[29].cuil, situacion: 1 },
  { cuil: USUARIOS_NUEVOS[31].cuil, situacion: 2 },
];

// ─── Función exito según índice ───────────────────────────────────────────────

function resolverExito(index: number): boolean | null {
  if (index % 10 === 0) return null;   // ~10% pendientes
  if (index % 7 === 0) return false;   // ~15% rechazadas
  return true;                          // ~75% confirmadas
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const clienteRepo   = AppDataSource.getRepository(Cliente);
    const usuarioRepo   = AppDataSource.getRepository(Usuario);
    const productoRepo  = AppDataSource.getRepository(Producto);
    const recomRepo     = AppDataSource.getRepository(Recomendacion);
    const consultaRepo  = AppDataSource.getRepository(ConsultaUsuario);
    const cambioRepo    = AppDataSource.getRepository(CambioSituacion);

    const cliente = await clienteRepo.findOne({ where: { email: DEMO_EMAIL } });
    if (!cliente) throw new Error(`Cliente ${DEMO_EMAIL} no encontrado. Ejecutá seed-demo.ts primero.`);
    console.log(`Cliente: ${cliente.nombre} (${cliente.id})\n`);

    const productos = await productoRepo.find({ where: { clienteId: cliente.id, activo: true } });
    if (productos.length === 0) throw new Error("El cliente no tiene productos activos.");

    // ── 1. Usuarios ────────────────────────────────────────────────────────────
    let usuariosCreados = 0;
    const usuariosInsertados: string[] = [];

    for (const u of USUARIOS_NUEVOS) {
      const existe = await usuarioRepo.findOne({
        where: { cuil: u.cuil, cliente: { id: cliente.id } },
      });
      if (existe) continue;

      await usuarioRepo.save(
        usuarioRepo.create({ cuil: u.cuil, nombre: u.nombre, cliente: { id: cliente.id } }),
      );
      usuariosCreados++;
      usuariosInsertados.push(u.cuil);
    }
    console.log(`Usuarios creados: ${usuariosCreados}`);

    // ── 2a. Recomendaciones existentes: actualizar exito ───────────────────────
    const existentes = await recomRepo.find({
      where: { cliente: { id: cliente.id }, exito: IsNull() },
    });
    let recomsActualizadas = 0;

    for (let i = 0; i < existentes.length; i++) {
      const nuevo = resolverExito(i);
      if (nuevo === null) continue;
      existentes[i].exito = nuevo;
      await recomRepo.save(existentes[i]);
      recomsActualizadas++;
    }
    console.log(`Recomendaciones actualizadas: ${recomsActualizadas} / ${existentes.length}`);

    // ── 2b. Recomendaciones nuevas para los primeros 20 usuarios insertados ────
    const candidatos = USUARIOS_NUEVOS.slice(0, 20);
    let recomsCreadas = 0;
    let recomIdx = 0;

    for (const u of candidatos) {
      const cantRecs = recomIdx % 3 === 0 ? 2 : 1;  // algunos tienen 2 recomendaciones
      for (let r = 0; r < cantRecs; r++) {
        const producto = productos[recomIdx % productos.length];
        const timestamp = diasAtras(Math.floor(Math.random() * 60));
        const exito = resolverExito(recomIdx);

        await recomRepo.save(
          recomRepo.create({
            timestamp,
            exito,
            cliente: { id: cliente.id },
            usuario: { cuil: u.cuil },
            producto: { id: producto.id },
          }),
        );
        recomsCreadas++;
        recomIdx++;
      }
    }
    console.log(`Recomendaciones creadas: ${recomsCreadas}`);

    // ── 3. consultas_usuario: upsert para los 32 nuevos ───────────────────────
    let consultasCreadas = 0;
    let consultasActualizadas = 0;

    for (const dato of DATOS_CARTERA) {
      const existente = await consultaRepo.findOne({
        where: { cliente: { id: cliente.id }, cuil: dato.cuil },
      });
      if (existente) {
        existente.situacion = dato.situacion;
        await consultaRepo.save(existente);
        consultasActualizadas++;
      } else {
        await consultaRepo.save(
          consultaRepo.create({
            cliente: { id: cliente.id },
            cuil: dato.cuil,
            situacion: dato.situacion,
          }),
        );
        consultasCreadas++;
      }
    }
    console.log(`Consultas creadas: ${consultasCreadas}, actualizadas: ${consultasActualizadas}`);

    // ── 4. cambios_situacion: 14 nuevos ───────────────────────────────────────
    let cambiosCreados = 0;

    for (const dato of DATOS_CARTERA) {
      if (!dato.cambio) continue;
      await cambioRepo.save(
        cambioRepo.create({
          cliente: { id: cliente.id },
          cuil: dato.cuil,
          situacionAnterior: dato.cambio.anterior,
          situacionNueva: dato.cambio.nueva,
          detectadoAt: diasAtras(dato.cambio.diasAtras),
        }),
      );
      cambiosCreados++;
    }
    console.log(`Cambios de situación creados: ${cambiosCreados}`);

    console.log("\n--- RESUMEN FINAL ---");
    const totalUsuarios = await usuarioRepo.count({ where: { cliente: { id: cliente.id } } });
    const totalConsultas = await consultaRepo.count({ where: { cliente: { id: cliente.id } } });
    const totalCambios = await cambioRepo.count({ where: { cliente: { id: cliente.id } } });
    const totalRecs = await recomRepo.count({ where: { cliente: { id: cliente.id } } });

    console.log(`Total usuarios monitoreados:  ${totalUsuarios}`);
    console.log(`Total consultas en cartera:   ${totalConsultas}`);
    console.log(`Total cambios detectados:     ${totalCambios}`);
    console.log(`Total recomendaciones:        ${totalRecs}`);
    console.log("\nEndpoints para verificar:");
    console.log("  GET /api/v1/portfolio/tamanio  → total CUILs monitoreados");
    console.log("  GET /api/v1/portfolio           → cambios del último mes");
  } finally {
    await AppDataSource.destroy();
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
