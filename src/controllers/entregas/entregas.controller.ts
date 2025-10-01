import { Request, Response } from "express";
import pool from "../../config/db";

export const listEntregas = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM entregas_tablas_registrador");
    res.json({
      data: rows,
      message: "Lista de entregas y devoluciones",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al listar entregas",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const createEntrega = async (req: Request, res: Response) => {
  const { id_brigada, id_registrador, rango_inicio, rango_fin, tipo, observacion, total_entregado, total_devolucion } = req.body;
  if (!id_brigada || !id_registrador || !rango_inicio || !rango_fin || !tipo) {
    return res.status(400).json({
      data: null,
      message: "Faltan campos obligatorios",
      error: null,
      status: 400
    });
  }
  try {
    const [result]: any = await pool.query(
      "INSERT INTO entregas_tablas_registrador (id_brigada, id_registrador, rango_inicio, rango_fin, tipo, observacion, total_entregado, total_devolucion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [id_brigada, id_registrador, rango_inicio, rango_fin, tipo, observacion ?? null, total_entregado ?? null, total_devolucion ?? null]
    );
    res.json({
      data: {
        id: result.insertId,
        id_brigada,
        id_registrador,
        rango_inicio,
        rango_fin,
        tipo,
        observacion,
        total_entregado,
        total_devolucion
      },
      message: "Registro creado exitosamente",
      error: null,
      status: 201
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al crear registro",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const updateEntrega = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id_brigada, id_registrador, rango_inicio, rango_fin, tipo, observacion, total_entregado, total_devolucion } = req.body;
  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El id es requerido",
      error: null,
      status: 400
    });
  }
  try {
    const [result]: any = await pool.query(
      "UPDATE entregas_tablas_registrador SET id_brigada = ?, id_registrador = ?, rango_inicio = ?, rango_fin = ?, tipo = ?, observacion = ?, total_entregado = ?, total_devolucion = ? WHERE id = ?",
      [id_brigada, id_registrador, rango_inicio, rango_fin, tipo, observacion, total_entregado, total_devolucion, id]
    );
    if (result.affectedRows > 0) {
      res.json({
        data: {
          id,
          id_brigada,
          id_registrador,
          rango_inicio,
          rango_fin,
          tipo,
          observacion,
          total_entregado,
          total_devolucion
        },
        message: "Registro actualizado exitosamente",
        error: null,
        status: 200
      });
    } else {
      res.status(404).json({
        data: null,
        message: "No se encontró el registro",
        error: null,
        status: 404
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al actualizar registro",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const deleteEntrega = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El id es requerido",
      error: null,
      status: 400
    });
  }
  try {
    const [result]: any = await pool.query("DELETE FROM entregas_tablas_registrador WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      res.json({
        data: null,
        message: "Registro eliminado exitosamente",
        error: null,
        status: 200
      });
    } else {
      res.status(404).json({
        data: null,
        message: "No se encontró el registro",
        error: null,
        status: 404
      });
    }
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al eliminar registro",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const findByBrigadaRegistrador = async (req: Request, res: Response) => {
  const { id_brigada, id_registrador } = req.query;
  if (!id_brigada || !id_registrador) {
    return res.status(400).json({
      data: null,
      message: "id_brigada e id_registrador son requeridos como query params",
      error: null,
      status: 400
    });
  }
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM entregas_tablas_registrador WHERE id_brigada = ? AND id_registrador = ?",
      [id_brigada, id_registrador]
    );
    res.json({
      data: rows,
      message: "Registros filtrados por brigada y registrador",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al buscar registros",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};
