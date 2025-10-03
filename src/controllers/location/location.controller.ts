import { Request, Response } from 'express';
import pool from "../../config/db";

export const getProvincias = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('SELECT * FROM provincias ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener provincias:', error);
        res.status(500).json({ message: 'Error al obtener las provincias' });
    }
};

export const getCantonesByProvincia = async (req: Request, res: Response) => {
    try {
        const { provinciaId } = req.params;
        const [rows]: any = await pool.query(
            'SELECT * FROM cantones WHERE provincia_id = $1 ORDER BY nombre',
            [provinciaId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener cantones:', error);
        res.status(500).json({ message: 'Error al obtener los cantones' });
    }
};

export const getBarriosByCanton = async (req: Request, res: Response) => {
    try {
        const { cantonId } = req.params;
        const [rows]: any = await pool.query(
            'SELECT * FROM barrios WHERE canton_id = $1 ORDER BY nombre',
            [cantonId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener barrios:', error);
        res.status(500).json({ message: 'Error al obtener los barrios' });
    }
};
