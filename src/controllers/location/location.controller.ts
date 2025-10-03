import { Request, Response } from 'express';
import pool from "../../config/db";

// Obtener todas las provincias
export const getProvincias = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM provincias ORDER BY nombre');
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener provincias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener las provincias' 
    });
  }
};

// Obtener cantones por provincia
export const getCantonesByProvincia = async (req: Request, res: Response) => {
  try {
    const { provinciaId } = req.params;
    const [rows]: any = await pool.query(
      'SELECT * FROM cantones WHERE provincia_id = ? ORDER BY nombre',
      [provinciaId]
    );
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron cantones para esta provincia'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener cantones:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener los cantones' 
    });
  }
};

// Obtener barrios por cantón
export const getBarriosByCanton = async (req: Request, res: Response) => {
  try {
    const { cantonId } = req.params;
    const [rows]: any = await pool.query(
        'SELECT ID as id, BARRIO as nombre FROM barrios WHERE canton_id = ? ORDER BY BARRIO',
      [cantonId]
    );
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron barrios para este cantón'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener barrios:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener los barrios' 
    });
  }
};

// Obtener parroquias por cantón (nuevo método)
export const getParroquiasByCanton = async (req: Request, res: Response) => {
  try {
    const { cantonNombre } = req.params;
    const [rows]: any = await pool.query(
      'SELECT * FROM parroquias WHERE canton_nombre = ? ORDER BY nombre',
      [cantonNombre]
    );
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener parroquias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener las parroquias' 
    });
  }
};

// Obtener recintos por cantón y parroquia (nuevo método)
export const getRecintosByCantonParroquia = async (req: Request, res: Response) => {
  try {
    const { cantonNombre, parroquiaNombre } = req.params;
    const [rows]: any = await pool.query(
      'SELECT * FROM recintos WHERE canton_nombre = ? AND parroquia_nombre = ? ORDER BY nombre',
      [cantonNombre, parroquiaNombre]
    );
    
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error al obtener recintos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener los recintos' 
    });
  }
};
