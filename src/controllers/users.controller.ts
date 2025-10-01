import { Request, Response } from "express";
import pool from "../config/db";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users"); 
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};
