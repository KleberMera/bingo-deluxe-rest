import { Request, Response } from "express";
import pool from "../../config/db";

export const searchBingoTable = async (req: Request, res: Response) => {
  const { id_card, phone, table_code } = req.body;

  // Construir condiciones dinámicas
  let whereClauses: string[] = [];
  let params: any[] = [];

  if (id_card) {
    whereClauses.push("u.id_card = ?");
    params.push(id_card);
  }
  if (phone) {
    whereClauses.push("u.phone = ?");
    params.push(phone);
  }
  if (table_code) {
    // Buscar por coincidencia exacta o por rango
    // Ejemplo: table_code = "2001_2004" debe permitir buscar por 2001, 2002, 2003, 2004
    whereClauses.push(`(
      bt.table_code = ?
      OR (
        ? BETWEEN CAST(SUBSTRING_INDEX(bt.table_code, '_', 1) AS UNSIGNED)
        AND CAST(SUBSTRING_INDEX(bt.table_code, '_', -1) AS UNSIGNED)
      )
    )`);
    params.push(table_code);
    params.push(table_code);
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT
      bt.id,
      bt.table_code,
      bt.file_name,
      bt.file_url,
      bt.created_at,
      bt.entregado,
      bt.registro_manual,
      bt.ocr_validated,
      bt.ocr_confidence,
      u.first_name,
      u.last_name,
      u.phone,
      u.id_card,
      c.nombre AS canton,
      b.BARRIO AS barrio,
      p.nombre AS provincia,
  NULL AS brigada,
      u.ubicacion_detallada,
      u.latitud,
      u.longitud,
      CAST(SUBSTRING_INDEX(bt.table_code, '_', 1) AS UNSIGNED) AS rango_inicio,
      CAST(SUBSTRING_INDEX(bt.table_code, '_', -1) AS UNSIGNED) AS rango_fin,
      r.nombre_registrador AS registrador_nombre,
      NULL AS registrador_apellido,
      NULL AS registrador_telefono
    FROM bingo_tables bt
    LEFT JOIN users u ON u.id_tabla = bt.id
    LEFT JOIN cantones c ON u.canton_id = c.id
    LEFT JOIN barrios b ON u.barrio_id = b.ID
    LEFT JOIN provincias p ON u.provincia_id = p.id
  -- LEFT JOIN brigadas br ON u.id_brigada = br.id_brigada
    LEFT JOIN registrador r ON u.id_registrador = r.id
    ${where}
    LIMIT 1
  `;

  try {
    const [rows]: any = await pool.query(query, params);
    if (rows && rows.length > 0) {
      res.json({
        data: rows[0],
        message: "Bingo encontrado",
        error: null,
        status: 200
      });
    } else {
      res.status(404).json({
        data: null,
        message: "No se encontró información",
        error: null,
        status: 404
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error en la búsqueda",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};
