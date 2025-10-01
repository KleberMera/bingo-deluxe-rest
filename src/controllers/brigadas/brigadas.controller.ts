import { Request, Response } from "express";
import pool from "../../config/db";

export const listBrigadas = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT id_brigada, nombre_brigada, descripcion, fecha_creacion, activa, max_tables_per_person FROM brigadas");
    res.json({
      data: rows,
      message: "Lista de brigadas",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al listar brigadas",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const createBrigada = async (req: Request, res: Response) => {
  const { nombre_brigada, descripcion, activa, max_tables_per_person } = req.body;
  if (!nombre_brigada) {
    return res.status(400).json({
      data: null,
      message: "El nombre_brigada es requerido",
      error: null,
      status: 400
    });
  }
  try {
    const [result]: any = await pool.query(
      "INSERT INTO brigadas (nombre_brigada, descripcion, activa, max_tables_per_person) VALUES (?, ?, ?, ?)",
      [nombre_brigada, descripcion ?? null, activa ?? 1, max_tables_per_person ?? 1]
    );
    res.json({
      data: {
        id_brigada: result.insertId,
        nombre_brigada,
        descripcion,
        activa: activa ?? 1,
        max_tables_per_person: max_tables_per_person ?? 1
      },
      message: "Brigada creada exitosamente",
      error: null,
      status: 201
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al crear brigada",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const updateBrigada = async (req: Request, res: Response) => {
  const { id_brigada } = req.params;
  const { nombre_brigada, descripcion, activa, max_tables_per_person } = req.body;
  if (!id_brigada) {
    return res.status(400).json({
      data: null,
      message: "El id_brigada es requerido",
      error: null,
      status: 400
    });
  }
  try {
    const [result]: any = await pool.query(
      "UPDATE brigadas SET nombre_brigada = ?, descripcion = ?, activa = ?, max_tables_per_person = ? WHERE id_brigada = ?",
      [nombre_brigada, descripcion, activa, max_tables_per_person, id_brigada]
    );
    if (result.affectedRows > 0) {
      res.json({
        data: {
          id_brigada,
          nombre_brigada,
          descripcion,
          activa,
          max_tables_per_person
        },
        message: "Brigada actualizada exitosamente",
        error: null,
        status: 200
      });
    } else {
      res.status(404).json({
        data: null,
        message: "No se encontró la brigada",
        error: null,
        status: 404
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al actualizar brigada",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};
