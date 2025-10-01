
import { Request, Response } from "express";
import pool from "../../config/db";



export const findRegistradorByName = async (req: Request, res: Response) => {
  const { nombre_registrador } = req.query;
  if (!nombre_registrador || typeof nombre_registrador !== 'string') {
    return res.status(400).json({
      data: null,
      message: "El nombre_registrador es requerido como query param",
      error: null,
      status: 400
    });
  }
  try {
    const [rows]: any = await pool.query(
      "SELECT id, nombre_registrador FROM registrador WHERE nombre_registrador LIKE ?",
      [`%${nombre_registrador}%`]
    );
    res.json({
      data: rows,
      message: "Resultado de búsqueda de registrador",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al buscar registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const listRegistradores = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT id, nombre_registrador FROM registrador");
    res.json({
      data: rows,
      message: "Lista de registradores",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al listar registradores",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const createRegistrador = async (req: Request, res: Response) => {
  const { nombre_registrador } = req.body;
  if (!nombre_registrador) {
    return res.status(400).json({
      data: null,
      message: "El nombre_registrador es requerido",
      error: null,
      status: 400
    });
  }
  try {
    const [result]: any = await pool.query(
      "INSERT INTO registrador (nombre_registrador) VALUES (?)",
      [nombre_registrador]
    );
    res.json({
      data: { id: result.insertId, nombre_registrador },
      message: "Registrador creado exitosamente",
      error: null,
      status: 201
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al crear registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};
