import { Request, Response } from "express";
import pool from "../../config/db";

interface Asistencia {
  id: number;
  nombres: string;
  apellidos: string;
  celular: string;
  cedula?: string | null;
  id_brigada: number;
  nombre_brigada?: string;
  created_at: Date;
}

export const registrarAsistencia = async (req: Request, res: Response) => {
  const { nombres, apellidos, celular, cedula } = req.body;

  // Validaciones básicas
  if (!nombres || !apellidos || !celular) {
    return res.status(400).json({
      success: false,
      message: "Los campos nombres, apellidos y celular son obligatorios"
    });
  }

  // Validar formato de celular (al menos 7 dígitos)
  if (!/^\d{7,15}$/.test(celular.replace(/\s|-/g, ""))) {
    return res.status(400).json({
      success: false,
      message: "El celular debe contener entre 7 y 15 dígitos"
    });
  }

  const connection = await pool.getConnection();

  try {
    // Obtener la brigada activa
    const [brigadaRows]: any = await connection.query(
      `SELECT id_brigada, nombre_brigada, activa 
       FROM brigadas 
       WHERE activa = 1 
       ORDER BY fecha_creacion DESC 
       LIMIT 1`
    );

    if (brigadaRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay brigadas activas disponibles"
      });
    }

    const activeBrigade = brigadaRows[0];

    // Verificar si ya existe asistencia con la misma cédula en la misma brigada
    if (cedula) {
      const [existingAsistencia]: any = await connection.query(
        `SELECT id, nombres, apellidos, cedula, created_at 
         FROM asistencia 
         WHERE cedula = ? AND id_brigada = ?`,
        [cedula.trim(), activeBrigade.id_brigada]
      );

      if (existingAsistencia.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Esta persona ya tiene registro de asistencia en esta brigada",
          data: {
            id: existingAsistencia[0].id,
            nombres: existingAsistencia[0].nombres,
            apellidos: existingAsistencia[0].apellidos,
            cedula: existingAsistencia[0].cedula,
            fecha_registro: existingAsistencia[0].created_at
          }
        });
      }
    }

    // Insertar el registro de asistencia
    const [result]: any = await connection.query(
      `INSERT INTO asistencia (
        nombres, apellidos, celular, cedula, id_brigada
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        nombres.trim(),
        apellidos.trim(),
        celular.trim(),
        cedula ? cedula.trim() : null,
        activeBrigade.id_brigada
      ]
    );

    // Obtener el registro recién creado
    const [newRecord]: any = await connection.query(
      `SELECT 
        a.id,
        a.nombres,
        a.apellidos,
        a.celular,
        a.cedula,
        a.id_brigada,
        b.nombre_brigada,
        DATE_FORMAT(CONVERT_TZ(a.created_at, @@session.time_zone, 'America/Guayaquil'), '%Y-%m-%d %H:%i:%S') as created_at
      FROM asistencia a
      LEFT JOIN brigadas b ON a.id_brigada = b.id_brigada
      WHERE a.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: "Asistencia registrada exitosamente",
      data: newRecord[0]
    });
  } catch (error) {
    console.error("Error en registrarAsistencia:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Error interno del servidor"
    });
  } finally {
    connection.release();
  }
};

export const obtenerAsistencias = async (req: Request, res: Response) => {
  const { id_brigada } = req.query;
  const connection = await pool.getConnection();

  try {
    let query = `SELECT 
      a.id,
      a.nombres,
      a.apellidos,
      a.celular,
      a.cedula,
      a.id_brigada,
      b.nombre_brigada,
      DATE_FORMAT(CONVERT_TZ(a.created_at, @@session.time_zone, 'America/Guayaquil'), '%Y-%m-%d %H:%i:%S') as created_at
    FROM asistencia a
    LEFT JOIN brigadas b ON a.id_brigada = b.id_brigada`;

    const params: any[] = [];

    if (id_brigada) {
      query += ` WHERE a.id_brigada = ?`;
      params.push(id_brigada);
    }

    query += ` ORDER BY a.created_at DESC`;

    const [rows]: any = await connection.query(query, params);

    res.status(200).json({
      success: true,
      message: "Asistencias obtenidas exitosamente",
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error("Error en obtenerAsistencias:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las asistencias",
      data: null
    });
  } finally {
    connection.release();
  }
};

export const obtenerAsistenciasPorBrigadaActiva = async (
  _req: Request,
  res: Response
) => {
  const connection = await pool.getConnection();

  try {
    // Obtener la brigada activa
    const [brigadaRows]: any = await connection.query(
      `SELECT id_brigada, nombre_brigada, activa 
       FROM brigadas 
       WHERE activa = 1 
       ORDER BY fecha_creacion DESC 
       LIMIT 1`
    );

    if (brigadaRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No hay brigadas activas disponibles",
        data: null
      });
    }

    const activeBrigade = brigadaRows[0];

    // Obtener asistencias de la brigada activa
    const [rows]: any = await connection.query(
      `SELECT 
        a.id,
        a.nombres,
        a.apellidos,
        a.celular,
        a.cedula,
        a.id_brigada,
        b.nombre_brigada,
        DATE_FORMAT(CONVERT_TZ(a.created_at, @@session.time_zone, 'America/Guayaquil'), '%Y-%m-%d %H:%i:%S') as created_at
      FROM asistencia a
      LEFT JOIN brigadas b ON a.id_brigada = b.id_brigada
      WHERE a.id_brigada = ?
      ORDER BY a.created_at DESC`,
      [activeBrigade.id_brigada]
    );

    res.status(200).json({
      success: true,
      message: "Asistencias de la brigada activa obtenidas exitosamente",
      brigada_activa: {
        id_brigada: activeBrigade.id_brigada,
        nombre_brigada: activeBrigade.nombre_brigada
      },
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error("Error en obtenerAsistenciasPorBrigadaActiva:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las asistencias",
      data: null
    });
  } finally {
    connection.release();
  }
};

export const eliminarAsistencia = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({
      success: false,
      message: "ID de asistencia inválido"
    });
  }

  const connection = await pool.getConnection();

  try {
    // Verificar que el registro existe
    const [existingRecords]: any = await connection.query(
      `SELECT id FROM asistencia WHERE id = ?`,
      [id]
    );

    if (existingRecords.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Registro de asistencia no encontrado"
      });
    }

    // Eliminar el registro
    const [result]: any = await connection.query(
      `DELETE FROM asistencia WHERE id = ?`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Asistencia eliminada exitosamente",
      data: {
        id: Number(id)
      }
    });
  } catch (error) {
    console.error("Error en eliminarAsistencia:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la asistencia"
    });
  } finally {
    connection.release();
  }
};

export const obtenerResumenAsistencias = async (
  _req: Request,
  res: Response
) => {
  const connection = await pool.getConnection();

  try {
    const [rows]: any = await connection.query(
      `SELECT 
        b.id_brigada,
        b.nombre_brigada,
        COUNT(a.id) AS total_asistencias
      FROM brigadas b
      LEFT JOIN asistencia a ON b.id_brigada = a.id_brigada
      GROUP BY b.id_brigada, b.nombre_brigada
      ORDER BY b.nombre_brigada`
    );

    res.status(200).json({
      success: true,
      message: "Resumen de asistencias obtenido exitosamente",
      data: rows
    });
  } catch (error) {
    console.error("Error en obtenerResumenAsistencias:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener el resumen de asistencias",
      data: null
    });
  } finally {
    connection.release();
  }
};
