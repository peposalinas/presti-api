/**
 * Seed de datos ficticios para cambios_situacion y consultas_usuario.
 * Pobla el cliente demo.hackathon@presti.local con cambios de situación
 * crediticia tanto positivos (mejora) como negativos (empeora).
 *
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/seed-cartera.ts
 */

import "reflect-metadata";
import AppDataSource from "../database/data-source";
import { CambioSituacion } from "../modules/cartera/entities/cambio-situacion.entity";
import { ConsultaUsuario } from "../modules/cartera/entities/consulta-usuario.entity";
import { Cliente } from "../modules/clientes/entities/cliente.entity";

const DEMO_EMAIL = "demo.hackathon@presti.local";

// CUILs del cliente demo (los mismos del seed principal)
const CUILS = [
  "20200000995",
  "20200009550",
  "27200046906",
  "23200077024",
  "27200095974",
  "20200100299",
  "20200102534",
  "27200057347",
];

// Datos ficticios: situacion actual en consultas_usuario + cambios detectados
interface DatosSeed {
  cuil: string;
  situacionActual: number;           // valor en consultas_usuario
  cambios: {
    situacionAnterior: number;
    situacionNueva: number;
    diasAtras: number;               // cuántos días atrás se detectó el cambio
  }[];
}

const DATOS: DatosSeed[] = [
  {
    cuil: "20200000995",
    situacionActual: 3,
    cambios: [
      // Empeoró: de 1 a 2 (hace 20 días) y luego de 2 a 3 (hace 5 días)
      { situacionAnterior: 1, situacionNueva: 2, diasAtras: 20 },
      { situacionAnterior: 2, situacionNueva: 3, diasAtras: 5 },
    ],
  },
  {
    cuil: "20200009550",
    situacionActual: 1,
    cambios: [
      // Mejoró: de 3 a 2 (hace 25 días) y de 2 a 1 (hace 10 días)
      { situacionAnterior: 3, situacionNueva: 2, diasAtras: 25 },
      { situacionAnterior: 2, situacionNueva: 1, diasAtras: 10 },
    ],
  },
  {
    cuil: "27200046906",
    situacionActual: 2,
    cambios: [
      // Empeoró: de 1 a 2 (hace 8 días)
      { situacionAnterior: 1, situacionNueva: 2, diasAtras: 8 },
    ],
  },
  {
    cuil: "23200077024",
    situacionActual: 1,
    cambios: [
      // Mejoró: de 4 a 1 (hace 3 días — recuperación notable)
      { situacionAnterior: 4, situacionNueva: 1, diasAtras: 3 },
    ],
  },
  {
    cuil: "27200095974",
    situacionActual: 5,
    cambios: [
      // Empeoró fuerte: de 2 a 5 (hace 2 días)
      { situacionAnterior: 2, situacionNueva: 5, diasAtras: 2 },
    ],
  },
  {
    // Sin cambios detectados, solo consulta registrada
    cuil: "20200100299",
    situacionActual: 1,
    cambios: [],
  },
  {
    cuil: "20200102534",
    situacionActual: 2,
    cambios: [
      // Empeoró: de 1 a 2 (hace 45 días — fuera del mes por defecto)
      { situacionAnterior: 1, situacionNueva: 2, diasAtras: 45 },
    ],
  },
  {
    cuil: "27200057347",
    situacionActual: 1,
    cambios: [
      // Mejoró: de 2 a 1 (hace 15 días)
      { situacionAnterior: 2, situacionNueva: 1, diasAtras: 15 },
    ],
  },
];

async function main(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const clienteRepo = AppDataSource.getRepository(Cliente);
    const consultaRepo = AppDataSource.getRepository(ConsultaUsuario);
    const cambioRepo = AppDataSource.getRepository(CambioSituacion);

    const cliente = await clienteRepo.findOne({ where: { email: DEMO_EMAIL } });
    if (!cliente) {
      throw new Error(`Cliente ${DEMO_EMAIL} no encontrado. Ejecutá seed-demo.ts primero.`);
    }

    console.log(`Cliente encontrado: ${cliente.nombre} (${cliente.id})`);

    let consultasCreadas = 0;
    let consultasActualizadas = 0;
    let cambiosCreados = 0;

    for (const dato of DATOS) {
      // Upsert en consultas_usuario
      const existente = await consultaRepo.findOne({
        where: { cliente: { id: cliente.id }, cuil: dato.cuil },
      });

      if (existente) {
        existente.situacion = dato.situacionActual;
        await consultaRepo.save(existente);
        consultasActualizadas++;
      } else {
        await consultaRepo.save(
          consultaRepo.create({
            cliente: { id: cliente.id },
            cuil: dato.cuil,
            situacion: dato.situacionActual,
          }),
        );
        consultasCreadas++;
      }

      // Insertar cambios ficticios
      for (const cambio of dato.cambios) {
        const detectadoAt = new Date();
        detectadoAt.setDate(detectadoAt.getDate() - cambio.diasAtras);

        await cambioRepo.save(
          cambioRepo.create({
            cliente: { id: cliente.id },
            cuil: dato.cuil,
            situacionAnterior: cambio.situacionAnterior,
            situacionNueva: cambio.situacionNueva,
            detectadoAt,
          }),
        );
        cambiosCreados++;
      }
    }

    console.log("--- RESUMEN ---");
    console.log(`Consultas creadas:    ${consultasCreadas}`);
    console.log(`Consultas actualizadas: ${consultasActualizadas}`);
    console.log(`Cambios insertados:   ${cambiosCreados}`);
    console.log("");
    console.log("Probá el endpoint:");
    console.log("  GET /api/v1/portfolio          → cambios del último mes");
    console.log("  GET /api/v1/portfolio?meses=2  → incluye el cambio de hace 45 días");
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
