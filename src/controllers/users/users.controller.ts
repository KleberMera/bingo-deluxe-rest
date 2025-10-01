import { Request, Response } from "express";
import pool from "../../config/db";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users"); 
    res.json({
      data: rows,
      message: "Usuarios obtenidos correctamente",
      error: null,
      status: 200
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      data: null,
      message: "Error al obtener usuarios",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};
