import { Request, Response } from "express";
import pool from "../../../config/db";

// Resumen general de métricas
export const overviewMetrics = async (req: Request, res: Response) => {
  try {
    const [[{ total_brigadas }]]: any = await pool.query("SELECT COUNT(*) AS total_brigadas FROM brigadas");
    const [[{ brigadas_activas }]]: any = await pool.query("SELECT COUNT(*) AS brigadas_activas FROM brigadas WHERE activa = 1");
    const [[{ total_registros }]]: any = await pool.query("SELECT COUNT(*) AS total_registros FROM usuarios_otros_sorteos");
    const [[{ total_hoy }]]: any = await pool.query("SELECT COUNT(*) AS total_hoy FROM usuarios_otros_sorteos WHERE DATE(fecha_registro) = CURDATE()");
    const [[{ registradores_activos }]]: any = await pool.query("SELECT COUNT(DISTINCT id_registrador) AS registradores_activos FROM entregas_tablas_registrador WHERE id_registrador IS NOT NULL");
    // en usuarios_otros_sorteos el id de la brigada está guardado en id_evento
    const [[{ total_usuarios_en_brigadas }]]: any = await pool.query(
      "SELECT COUNT(*) AS total_usuarios_en_brigadas FROM usuarios_otros_sorteos u WHERE u.id_evento IS NOT NULL"
    );

    res.json({
      data: {
        total_brigadas: Number(total_brigadas) || 0,
        brigadas_activas: Number(brigadas_activas) || 0,
        registradores_activos: Number(registradores_activos) || 0,
        total_registros: Number(total_registros) || 0,
        total_hoy: Number(total_hoy) || 0,
        total_usuarios_en_brigadas: Number(total_usuarios_en_brigadas) || 0
      },
      message: "Métricas generales",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al obtener métricas",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

// Listado de brigadas con total de registros asociados
export const brigadasWithCounts = async (req: Request, res: Response) => {
  try {
    // contar usuarios por brigada usando usuarios_otros_sorteos.id_evento
    const query = `
      SELECT b.id_brigada, b.nombre_brigada, b.activa,
        COALESCE(cnt.total, 0) AS total_registros
      FROM brigadas b
      LEFT JOIN (
        SELECT u.id_evento AS id_brigada, COUNT(u.id) AS total
        FROM usuarios_otros_sorteos u
        WHERE u.id_evento IS NOT NULL
        GROUP BY u.id_evento
      ) cnt ON cnt.id_brigada = b.id_brigada
      ORDER BY b.nombre_brigada
    `;
    const [rows]: any = await pool.query(query);
    res.json({ data: rows, message: "Brigadas con total de registros", error: null, status: 200 });
  } catch (error) {
    res.status(500).json({ data: null, message: "Error al listar brigadas con conteo", error: error instanceof Error ? error.message : error, status: 500 });
  }
};

// Registradores de una brigada y su total de registros
export const registradoresPorBrigada = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ data: null, message: "El id de la brigada es requerido", error: null, status: 400 });
  }
  try {
    const query = `
      SELECT r.id AS id_registrador, r.nombre_registrador,
        COALESCE(COUNT(u.id), 0) AS total_registros
      FROM (SELECT DISTINCT id_registrador FROM entregas_tablas_registrador WHERE id_brigada = ?) e
      LEFT JOIN registrador r ON r.id = e.id_registrador
      LEFT JOIN usuarios_otros_sorteos u ON u.id_registrador = r.id AND u.id_evento = ?
      GROUP BY r.id, r.nombre_registrador
      ORDER BY total_registros DESC
    `;
    const [rows]: any = await pool.query(query, [id, id]);
    res.json({ data: rows, message: `Registradores de la brigada ${id}`, error: null, status: 200 });
  } catch (error) {
    res.status(500).json({ data: null, message: "Error al obtener registradores por brigada", error: error instanceof Error ? error.message : error, status: 500 });
  }
};

// Registros por mes (últimos 12 meses)
export const registrosPorMes = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT DATE_FORMAT(fecha_registro, '%Y-%m') AS month, COUNT(*) AS total
       FROM usuarios_otros_sorteos
       WHERE fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
       GROUP BY month
       ORDER BY month`);

    // Normalizar meses faltantes (últimos 12 meses)
    const monthsMap: Record<string, number> = {};
    rows.forEach((r: any) => { monthsMap[r.month] = Number(r.total); });

    const result: { month: string; total: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = d.toISOString().slice(0, 7); // YYYY-MM
      result.push({ month: mm, total: monthsMap[mm] ?? 0 });
    }

    res.json({ data: result, message: "Registros por mes (últimos 12 meses)", error: null, status: 200 });
  } catch (error) {
    res.status(500).json({ data: null, message: "Error al obtener registros por mes", error: error instanceof Error ? error.message : error, status: 500 });
  }
};

// Endpoint único que devuelve todas las métricas solicitadas
export const allMetrics = async (req: Request, res: Response) => {
  try {
    // Ejecutar consultas en paralelo
    const qTotalBrigadas = pool.query("SELECT COUNT(*) AS total_brigadas FROM brigadas");
    const qBrigadasActivas = pool.query("SELECT COUNT(*) AS brigadas_activas FROM brigadas WHERE activa = 1");
    const qTotalRegistros = pool.query("SELECT COUNT(*) AS total_registros FROM usuarios_otros_sorteos");
    const qTotalHoy = pool.query("SELECT COUNT(*) AS total_hoy FROM usuarios_otros_sorteos WHERE DATE(fecha_registro) = CURDATE()");
    const qRegistradoresActivos = pool.query("SELECT COUNT(DISTINCT id_registrador) AS registradores_activos FROM entregas_tablas_registrador WHERE id_registrador IS NOT NULL");
    const qTotalUsuariosEnBrigadas = pool.query(
      "SELECT COUNT(*) AS total_usuarios_en_brigadas FROM usuarios_otros_sorteos u WHERE u.id_evento IS NOT NULL"
    );

    const qRegistrosPorMes = pool.query(
      `SELECT DATE_FORMAT(fecha_registro, '%Y-%m') AS month, COUNT(*) AS total
       FROM usuarios_otros_sorteos
       WHERE fecha_registro >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
       GROUP BY month
       ORDER BY month`
    );

    // totals por tipo por brigada (id_evento)
    const qTotalPorTipo = pool.query(
      `SELECT u.id_evento AS id_brigada, COALESCE(u.nombre_tipo_registrador, tr.nombre_tipo, 'SIN_TIPO') AS tipo, COUNT(*) AS total
       FROM usuarios_otros_sorteos u
       LEFT JOIN tipos_registradores tr ON u.id_tipo_registrador_snapshot = tr.id
       WHERE u.id_evento IS NOT NULL
       GROUP BY u.id_evento, tipo
       ORDER BY u.id_evento, total DESC`
    );

    const qBrigadasWithCounts = pool.query(
      `SELECT b.id_brigada, b.nombre_brigada, b.activa,
        COALESCE(cnt.total, 0) AS total_registros
      FROM brigadas b
      LEFT JOIN (
        SELECT u.id_evento AS id_brigada, COUNT(u.id) AS total
        FROM usuarios_otros_sorteos u
        WHERE u.id_evento IS NOT NULL
        GROUP BY u.id_evento
      ) cnt ON cnt.id_brigada = b.id_brigada
      ORDER BY b.nombre_brigada`
    );

    // registradores por brigada y por tipo (para mostrar nombres y totales)
    const qRegistradoresPorTipo = pool.query(
      `SELECT u.id_evento AS id_brigada, u.id_registrador, r.nombre_registrador,
        COALESCE(u.nombre_tipo_registrador, tr.nombre_tipo, 'SIN_TIPO') AS tipo, COUNT(*) AS total
       FROM usuarios_otros_sorteos u
       LEFT JOIN registrador r ON u.id_registrador = r.id
       LEFT JOIN tipos_registradores tr ON u.id_tipo_registrador_snapshot = tr.id
       WHERE u.id_evento IS NOT NULL
       GROUP BY u.id_evento, tipo, u.id_registrador
       ORDER BY u.id_evento, tipo, total DESC`
    );

    const results = await Promise.all([
      qTotalBrigadas,
      qBrigadasActivas,
      qTotalRegistros,
      qTotalHoy,
      qRegistradoresActivos,
      qTotalUsuariosEnBrigadas,
      qRegistrosPorMes,
      qTotalPorTipo,
      qBrigadasWithCounts,
      qRegistradoresPorTipo
    ]);

    const totalBRows = (results[0] as any)[0] as any[];
    const brigadasActivasRows = (results[1] as any)[0] as any[];
    const totalRegRows = (results[2] as any)[0] as any[];
    const totalHoyRows = (results[3] as any)[0] as any[];
    const registradoresActivosRows = (results[4] as any)[0] as any[];
    const totalUsuariosEnBrigadasRows = (results[5] as any)[0] as any[];
    const rowsPorMesArr = (results[6] as any)[0] as any[];
  const rowsPorTipoArr = (results[7] as any)[0] as any[];
  const brigadasRowsArr = (results[8] as any)[0] as any[];
  const registradoresPorTipoArr = (results[9] as any)[0] as any[];

    const overview = {
      total_brigadas: Number(totalBRows[0]?.total_brigadas ?? 0),
      brigadas_activas: Number(brigadasActivasRows[0]?.brigadas_activas ?? 0),
      registradores_activos: Number(registradoresActivosRows[0]?.registradores_activos ?? 0),
      total_registros: Number(totalRegRows[0]?.total_registros ?? 0),
      total_hoy: Number(totalHoyRows[0]?.total_hoy ?? 0),
      total_usuarios_en_brigadas: Number(totalUsuariosEnBrigadasRows[0]?.total_usuarios_en_brigadas ?? 0)
    };

    // Normalizar últimos 12 meses
    const monthsMap: Record<string, number> = {};
  rowsPorMesArr.forEach((r: any) => { monthsMap[r.month] = Number(r.total); });
    const now = new Date();
    const registrosPorMesNorm: { month: string; total: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = d.toISOString().slice(0, 7);
      registrosPorMesNorm.push({ month: mm, total: monthsMap[mm] ?? 0 });
    }

    // total por tipo por brigada: agrupar rowsPorTipoArr por id_brigada
    const tipoPorBrigadaMap: Record<string, { tipo: string; total: number }[]> = {};
    rowsPorTipoArr.forEach((r: any) => {
      const idb = String(r.id_brigada ?? '');
      if (!tipoPorBrigadaMap[idb]) tipoPorBrigadaMap[idb] = [];
      tipoPorBrigadaMap[idb].push({ tipo: r.tipo ?? 'SIN_TIPO', total: Number(r.total) });
    });

    // mapear registradores por brigada y tipo
    const registradoresPorBrigadaTipo: Record<string, { id_registrador: number | null; nombre_registrador: string | null; total: number }[]> = {};
    registradoresPorTipoArr.forEach((r: any) => {
      const idb = String(r.id_brigada ?? '');
      const key = `${idb}|${r.tipo ?? 'SIN_TIPO'}`;
      if (!registradoresPorBrigadaTipo[key]) registradoresPorBrigadaTipo[key] = [];
      registradoresPorBrigadaTipo[key].push({ id_registrador: r.id_registrador ?? null, nombre_registrador: r.nombre_registrador ?? null, total: Number(r.total) });
    });

    // Construir array final con brigadas y su desglose por tipo
    const brigadasConTipo = brigadasRowsArr.map((b: any) => ({
      id_brigada: b.id_brigada,
      nombre_brigada: b.nombre_brigada,
      activa: b.activa,
      total_registros: b.total_registros,
      total_por_tipo: (tipoPorBrigadaMap[String(b.id_brigada)] ?? []).map(t => ({
        tipo: t.tipo,
        total: t.total,
        registradores: registradoresPorBrigadaTipo[`${String(b.id_brigada)}|${t.tipo}`] ?? []
      }))
    }));

    res.json({
      data: {
        overview,
        registros_por_mes: registrosPorMesNorm,
        total_por_tipo_registro_por_brigada: brigadasConTipo,
        brigadas: brigadasRowsArr
      },
      message: "Todas las métricas",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({ data: null, message: "Error al obtener todas las métricas", error: error instanceof Error ? error.message : error, status: 500 });
  }
};
