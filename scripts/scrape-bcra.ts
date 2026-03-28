#!/usr/bin/env ts-node
/**
 * Script de scraping: Central de Deudores BCRA
 *
 * Recorre un rango de DNIs, construye CUILs de personas humanas
 * (prefijos 20, 23, 27), consulta los 3 endpoints de la API Central
 * de Deudores del BCRA y persiste los resultados en la base de datos.
 *
 * Los registros existentes se sobreescriben con datos frescos.
 *
 * Uso:
 *   npx ts-node scripts/scrape-bcra.ts <DNI_INICIO> <DNI_FIN> [CONCURRENCIA]
 *
 * Ejemplos:
 *   npx ts-node scripts/scrape-bcra.ts 1000000 5000000
 *   npx ts-node scripts/scrape-bcra.ts 20000000 30000000 5
 *
 * Guarda un checkpoint en scripts/.scrape-checkpoint para reanudar si
 * se interrumpe.
 */

import * as dotenv from 'dotenv';
import { Pool, PoolClient } from 'pg';
import axios, { AxiosError } from 'axios';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ─── Configuración ────────────────────────────────────────────────────────────

const DNI_INICIO    = parseInt(process.argv[2], 10);
const DNI_FIN       = parseInt(process.argv[3], 10);
const CONCURRENCIA  = parseInt(process.argv[4] ?? '2', 10);

if (!DNI_INICIO || !DNI_FIN || DNI_INICIO > DNI_FIN) {
  console.error('Uso: npx ts-node scripts/scrape-bcra.ts <DNI_INICIO> <DNI_FIN> [CONCURRENCIA]');
  console.error('Ejemplo: npx ts-node scripts/scrape-bcra.ts 1000000 5000000');
  process.exit(1);
}

const BCRA_URL         = process.env.BCRA_BASE_URL ?? 'https://api.bcra.gob.ar';
const DELAY_MS         = 300; // pausa entre lotes para no saturar la API
const CHECKPOINT_FILE  = path.join(__dirname, '.scrape-checkpoint');
const LOG_CADA_N_DNIS  = 500;

// ─── Pool de base de datos ────────────────────────────────────────────────────

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT ?? '5432', 10),
  user:     process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  ssl:      { rejectUnauthorized: false },
  max:      CONCURRENCIA * 2,
});

// ─── Generación de CUILs ─────────────────────────────────────────────────────

const PREFIJOS_HUMANOS = [20, 23, 27] as const;

/**
 * Calcula el dígito verificador de un CUIL/CUIT argentino.
 * Retorna null si la combinación (prefijo, DNI) no produce un CUIL válido.
 */
function calcularVerificador(prefijo: number, dni: number): number | null {
  const base  = `${prefijo}${String(dni).padStart(8, '0')}`;
  const mult  = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const suma  = base.split('').reduce((acc, d, i) => acc + Number(d) * mult[i], 0);
  const resto = suma % 11;

  if (resto === 0) return 0;
  if (resto === 1) {
    if (prefijo === 20) return null; // combinación inválida
    if (prefijo === 23) return 9;
    if (prefijo === 27) return 4;
  }
  return 11 - resto;
}

function generarCuils(dni: number): bigint[] {
  return PREFIJOS_HUMANOS.flatMap((prefijo) => {
    const v = calcularVerificador(prefijo, dni);
    if (v === null) return [];
    return [BigInt(`${prefijo}${String(dni).padStart(8, '0')}${v}`)];
  });
}

// ─── Tipos de respuesta BCRA ──────────────────────────────────────────────────

interface EntidadDeuda {
  entidad:               number;
  entidadNombre?:        string;
  situacion:             number;
  fechaSit1?:            string | null;
  monto:                 number;
  diasAtrasoPago?:       number | null;
  refinanciaciones?:     boolean;
  recategorizacionOblig?: boolean;
  situacionJuridica?:    boolean;
  irrecuperables?:       boolean;
  enRevision?:           boolean;
  procesoJud?:           boolean;
}

interface Periodo {
  periodo:   string;
  entidades: EntidadDeuda[];
}

interface ResultadoDeudas {
  identificacion: number;
  denominacion:   string;
  periodos:       Periodo[];
}

interface ChequeRechazado {
  causal:          string;
  entidad:         number;
  nroCheque:       number;
  fechaRechazo:    string;
  monto:           number;
  fechaPago?:      string | null;
  fechaPagoMulta?: string | null;
  estadoMulta?:    string | null;
  ctaPersonal?:    boolean;
  denomJuridica?:  string | null;
  enRevision?:     boolean;
  procesoJud?:     boolean;
}

interface ResultadoCheques {
  identificacion: number;
  denominacion:   string;
  causales:       ChequeRechazado[];
}

// ─── Llamadas a la API BCRA ───────────────────────────────────────────────────

async function fetchBcra<T>(endpoint: string): Promise<T | null> {
  try {
    const { data } = await axios.get<{ status: number; results: T }>(
      `${BCRA_URL}${endpoint}`,
      { timeout: 15_000 },
    );
    return data?.results ?? null;
  } catch (err) {
    const status = (err as AxiosError).response?.status;
    if (status === 404) return null;
    if (status === 429) {
      // Rate limit: esperar y reintentar una vez
      await sleep(5_000);
      try {
        const { data } = await axios.get<{ status: number; results: T }>(
          `${BCRA_URL}${endpoint}`,
          { timeout: 15_000 },
        );
        return data?.results ?? null;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─── Persistencia ─────────────────────────────────────────────────────────────

async function limpiarDatosExistentes(client: PoolClient, identificacion: bigint): Promise<void> {
  // Borrar deudas actuales (no hay CASCADE, hay que borrar hijos primero)
  await client.query(
    `DELETE FROM deuda_entidad
     WHERE deuda_periodo_id IN (
       SELECT id FROM deuda_periodo WHERE identificacion = $1
     )`,
    [identificacion],
  );
  await client.query(`DELETE FROM deuda_periodo WHERE identificacion = $1`, [identificacion]);

  // Borrar deudas históricas
  await client.query(
    `DELETE FROM deuda_historica_entidad
     WHERE deuda_hist_periodo_id IN (
       SELECT id FROM deuda_historica_periodo WHERE identificacion = $1
     )`,
    [identificacion],
  );
  await client.query(`DELETE FROM deuda_historica_periodo WHERE identificacion = $1`, [identificacion]);

  // Borrar cheques rechazados
  await client.query(`DELETE FROM cheque_rechazado WHERE identificacion = $1`, [identificacion]);
}

async function guardarDeudas(
  client: PoolClient,
  identificacion: bigint,
  resultado: ResultadoDeudas,
): Promise<void> {
  const ahora = new Date();
  for (const periodo of resultado.periodos ?? []) {
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO deuda_periodo (identificacion, periodo, fetched_at)
       VALUES ($1, $2, $3) RETURNING id`,
      [identificacion, periodo.periodo, ahora],
    );
    const periodoId = rows[0].id;

    for (const e of periodo.entidades ?? []) {
      await client.query(
        `INSERT INTO deuda_entidad (
           deuda_periodo_id, entidad, situacion, fecha_sit1, monto,
           dias_atraso_pago, refinanciaciones, recategorizacion_oblig,
           situacion_juridica, irrec_disposicion_tecnica, en_revision, proceso_jud
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          periodoId,
          e.entidadNombre ?? String(e.entidad),
          e.situacion,
          e.fechaSit1 ? new Date(e.fechaSit1) : null,
          e.monto,
          e.diasAtrasoPago ?? null,
          e.refinanciaciones ?? false,
          e.recategorizacionOblig ?? false,
          e.situacionJuridica ?? false,
          e.irrecuperables ?? false,
          e.enRevision ?? false,
          e.procesoJud ?? false,
        ],
      );
    }
  }
}

async function guardarDeudaHistorica(
  client: PoolClient,
  identificacion: bigint,
  resultado: ResultadoDeudas,
): Promise<void> {
  const ahora = new Date();
  for (const periodo of resultado.periodos ?? []) {
    const { rows } = await client.query<{ id: number }>(
      `INSERT INTO deuda_historica_periodo (identificacion, periodo, fetched_at)
       VALUES ($1, $2, $3) RETURNING id`,
      [identificacion, periodo.periodo, ahora],
    );
    const periodoId = rows[0].id;

    for (const e of periodo.entidades ?? []) {
      await client.query(
        `INSERT INTO deuda_historica_entidad (
           deuda_hist_periodo_id, entidad, situacion, monto, en_revision, proceso_jud
         ) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          periodoId,
          e.entidadNombre ?? String(e.entidad),
          e.situacion,
          e.monto,
          e.enRevision ?? false,
          e.procesoJud ?? false,
        ],
      );
    }
  }
}

async function guardarCheques(
  client: PoolClient,
  identificacion: bigint,
  resultado: ResultadoCheques,
): Promise<void> {
  const ahora = new Date();
  for (const ch of resultado.causales ?? []) {
    await client.query(
      `INSERT INTO cheque_rechazado (
         identificacion, causal, entidad, nro_cheque, fecha_rechazo,
         monto, fecha_pago, fecha_pago_multa, estado_multa,
         cta_personal, denom_juridica, en_revision, proceso_jud, fetched_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        identificacion,
        ch.causal,
        ch.entidad,
        ch.nroCheque,
        new Date(ch.fechaRechazo),
        ch.monto,
        ch.fechaPago      ? new Date(ch.fechaPago)      : null,
        ch.fechaPagoMulta ? new Date(ch.fechaPagoMulta) : null,
        ch.estadoMulta    ?? null,
        ch.ctaPersonal    ?? false,
        ch.denomJuridica  ?? null,
        ch.enRevision     ?? false,
        ch.procesoJud     ?? false,
        ahora,
      ],
    );
  }
}

// ─── Procesamiento por CUIL ───────────────────────────────────────────────────

async function procesarCuil(cuil: bigint): Promise<boolean> {
  const id = cuil.toString();

  const [deudas, historica, cheques] = await Promise.all([
    fetchBcra<ResultadoDeudas>(`/centraldedeudores/v1.0/Deudas/${id}`),
    fetchBcra<ResultadoDeudas>(`/centraldedeudores/v1.0/Deudas/Historicas/${id}`),
    fetchBcra<ResultadoCheques>(`/centraldedeudores/v1.0/Deudas/ChequesRechazados/${id}`),
  ]);

  const hayDatos =
    (deudas?.periodos?.length ?? 0) > 0 ||
    (historica?.periodos?.length ?? 0) > 0 ||
    (cheques?.causales?.length ?? 0) > 0;

  if (!hayDatos) return false;

  const denominacion =
    deudas?.denominacion ?? historica?.denominacion ?? cheques?.denominacion ?? '';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Sobreescribir: borrar datos anteriores y reinsertar
    await limpiarDatosExistentes(client, cuil);

    // Upsert persona
    await client.query(
      `INSERT INTO persona (identificacion, denominacion)
       VALUES ($1, $2)
       ON CONFLICT (identificacion)
       DO UPDATE SET denominacion = EXCLUDED.denominacion, updated_at = now()`,
      [cuil, denominacion],
    );

    if ((deudas?.periodos?.length ?? 0) > 0)   await guardarDeudas(client, cuil, deudas!);
    if ((historica?.periodos?.length ?? 0) > 0) await guardarDeudaHistorica(client, cuil, historica!);
    if ((cheques?.causales?.length ?? 0) > 0)   await guardarCheques(client, cuil, cheques!);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`  [ERROR] CUIL ${cuil}: ${(err as Error).message}`);
    return false;
  } finally {
    client.release();
  }
}

// ─── Checkpoint ───────────────────────────────────────────────────────────────

function leerCheckpoint(): number {
  try {
    const saved = parseInt(fs.readFileSync(CHECKPOINT_FILE, 'utf8').trim(), 10);
    return isNaN(saved) ? DNI_INICIO : saved;
  } catch {
    return DNI_INICIO;
  }
}

function guardarCheckpoint(dni: number): void {
  fs.writeFileSync(CHECKPOINT_FILE, String(dni));
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function formatNum(n: number): string {
  return n.toLocaleString('es-AR');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const dniInicio = leerCheckpoint();
  const total     = DNI_FIN - DNI_INICIO + 1;

  console.log('━━━ Scrape Central de Deudores BCRA ━━━━━━━━━━━━━━━━━━━');
  console.log(`  DNI rango     : ${formatNum(DNI_INICIO)} – ${formatNum(DNI_FIN)} (${formatNum(total)} DNIs)`);
  console.log(`  Concurrencia  : ${CONCURRENCIA} CUILs simultáneos`);
  console.log(`  Delay por lote: ${DELAY_MS}ms`);
  console.log(`  URL BCRA      : ${BCRA_URL}`);
  if (dniInicio > DNI_INICIO) {
    console.log(`  Checkpoint    : retomando desde DNI ${formatNum(dniInicio)}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let encontrados  = 0;
  let dnisProcesados = 0;

  for (let dni = dniInicio; dni <= DNI_FIN; dni += CONCURRENCIA) {
    const lote = Array.from(
      { length: Math.min(CONCURRENCIA, DNI_FIN - dni + 1) },
      (_, i) => dni + i,
    );

    const resultados = await Promise.all(
      lote.flatMap((d) =>
        generarCuils(d).map(async (cuil) => {
          const ok = await procesarCuil(cuil);
          if (ok) console.log(`  ✓ ${cuil}  (${deducirNombre(cuil)})`);
          return ok;
        }),
      ),
    );

    encontrados  += resultados.filter(Boolean).length;
    dnisProcesados += lote.length;
    guardarCheckpoint(dni + CONCURRENCIA);

    if (dnisProcesados % LOG_CADA_N_DNIS < CONCURRENCIA) {
      const pct = (((dni - DNI_INICIO) / total) * 100).toFixed(1);
      console.log(
        `\n  Progreso: DNI ${formatNum(dni)} | ${pct}% | encontrados: ${encontrados}\n`,
      );
    }

    await sleep(DELAY_MS);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Finalizado.`);
  console.log(`  DNIs procesados : ${formatNum(dnisProcesados)}`);
  console.log(`  Registros nuevos: ${encontrados}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await pool.end();
}

/** Ayuda visual: extrae el prefijo del CUIL para el log */
function deducirNombre(cuil: bigint): string {
  const s = cuil.toString();
  const prefijo = s.slice(0, 2);
  const dni     = s.slice(2, 10);
  return `prefijo ${prefijo} / DNI ${formatNum(parseInt(dni, 10))}`;
}

main().catch((err) => {
  console.error('\n[FATAL]', err.message ?? err);
  process.exit(1);
});
