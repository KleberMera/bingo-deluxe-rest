import { Request, Response } from "express";
import pool from "../../config/db";

export const listTiposRegistradores = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM tipos_registradores ORDER BY nombre_tipo ASC"
    );
    res.json({
      data: rows,
      message: "Lista de tipos de registradores",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al listar tipos de registradores",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const getTipoRegistradorById = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El ID del tipo de registrador es requerido",
      error: null,
      status: 400
    });
  }

  try {
    const [rows]: any = await pool.query(
      "SELECT * FROM tipos_registradores WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        data: null,
        message: "Tipo de registrador no encontrado",
        error: null,
        status: 404
      });
    }

    res.json({
      data: rows[0],
      message: "Tipo de registrador encontrado",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al obtener tipo de registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const createTipoRegistrador = async (req: Request, res: Response) => {
  const { nombre_tipo, descripcion, activo } = req.body;
  
  if (!nombre_tipo) {
    return res.status(400).json({
      data: null,
      message: "El nombre_tipo es requerido",
      error: null,
      status: 400
    });
  }

  try {
    // Verificar que no exista ya un tipo con el mismo nombre
    const [existingRows]: any = await pool.query(
      "SELECT id FROM tipos_registradores WHERE nombre_tipo = ?",
      [nombre_tipo]
    );

    if (existingRows.length > 0) {
      return res.status(400).json({
        data: null,
        message: "Ya existe un tipo de registrador con este nombre",
        error: null,
        status: 400
      });
    }

    const [result]: any = await pool.query(
      "INSERT INTO tipos_registradores (nombre_tipo, descripcion, activo) VALUES (?, ?, ?)",
      [nombre_tipo, descripcion || null, activo !== undefined ? activo : true]
    );

    res.json({
      data: {
        id: result.insertId,
        nombre_tipo,
        descripcion: descripcion || null,
        activo: activo !== undefined ? activo : true
      },
      message: "Tipo de registrador creado exitosamente",
      error: null,
      status: 201
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al crear tipo de registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const updateTipoRegistrador = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre_tipo, descripcion, activo } = req.body;

  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El ID del tipo de registrador es requerido",
      error: null,
      status: 400
    });
  }

  if (!nombre_tipo) {
    return res.status(400).json({
      data: null,
      message: "El nombre_tipo es requerido",
      error: null,
      status: 400
    });
  }

  try {
    // Verificar que el tipo existe
    const [existingRows]: any = await pool.query(
      "SELECT id FROM tipos_registradores WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        data: null,
        message: "Tipo de registrador no encontrado",
        error: null,
        status: 404
      });
    }

    // Verificar que no exista otro tipo con el mismo nombre (excluyendo el actual)
    const [duplicateRows]: any = await pool.query(
      "SELECT id FROM tipos_registradores WHERE nombre_tipo = ? AND id != ?",
      [nombre_tipo, id]
    );

    if (duplicateRows.length > 0) {
      return res.status(400).json({
        data: null,
        message: "Ya existe otro tipo de registrador con este nombre",
        error: null,
        status: 400
      });
    }

    // Actualizar el tipo
    await pool.query(
      "UPDATE tipos_registradores SET nombre_tipo = ?, descripcion = ?, activo = ? WHERE id = ?",
      [nombre_tipo, descripcion || null, activo !== undefined ? activo : true, id]
    );

    res.json({
      data: {
        id: parseInt(id),
        nombre_tipo,
        descripcion: descripcion || null,
        activo: activo !== undefined ? activo : true
      },
      message: "Tipo de registrador actualizado exitosamente",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al actualizar tipo de registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const deleteTipoRegistrador = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El ID del tipo de registrador es requerido",
      error: null,
      status: 400
    });
  }

  try {
    // Verificar que el tipo existe
    const [existingRows]: any = await pool.query(
      "SELECT id, nombre_tipo FROM tipos_registradores WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        data: null,
        message: "Tipo de registrador no encontrado",
        error: null,
        status: 404
      });
    }

    // Verificar si hay registradores usando este tipo
    const [registradoresRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM registrador WHERE id_tipo_registrador = ?",
      [id]
    );

    if (registradoresRows[0]?.count > 0) {
      return res.status(400).json({
        data: null,
        message: "No se puede eliminar el tipo porque hay registradores asociados",
        error: "TIPO_HAS_DEPENDENCIES",
        status: 400
      });
    }

    // Eliminar el tipo
    await pool.query("DELETE FROM tipos_registradores WHERE id = ?", [id]);

    res.json({
      data: {
        id: parseInt(id),
        nombre_tipo: existingRows[0].nombre_tipo
      },
      message: "Tipo de registrador eliminado exitosamente",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al eliminar tipo de registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const toggleTipoRegistradorStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El ID del tipo de registrador es requerido",
      error: null,
      status: 400
    });
  }

  try {
    // Obtener el estado actual
    const [currentRows]: any = await pool.query(
      "SELECT activo FROM tipos_registradores WHERE id = ?",
      [id]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({
        data: null,
        message: "Tipo de registrador no encontrado",
        error: null,
        status: 404
      });
    }

    const newStatus = !currentRows[0].activo;

    // Actualizar el estado
    await pool.query(
      "UPDATE tipos_registradores SET activo = ? WHERE id = ?",
      [newStatus, id]
    );

    res.json({
      data: {
        id: parseInt(id),
        activo: newStatus
      },
      message: `Tipo de registrador ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al cambiar estado del tipo de registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};
