
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
    // Usamos LEFT JOIN para traer los datos del tipo si existe
    const query = `
      SELECT
        r.*, 
        tr.id AS tipo_id,
        tr.nombre_tipo AS tipo_nombre,
        tr.descripcion AS tipo_descripcion,
        tr.activo AS tipo_activo
      FROM registrador r
      LEFT JOIN tipos_registradores tr ON r.id_tipo_registrador = tr.id
      ORDER BY r.nombre_registrador ASC
    `;

    const [rows]: any = await pool.query(query);

    // Mapear para devolver un objeto 'tipo' anidado cuando exista
    const mapped = rows.map((r: any) => {
      const tipo = r.tipo_id
        ? {
            id: r.tipo_id,
            nombre_tipo: r.tipo_nombre,
            descripcion: r.tipo_descripcion,
            activo: Boolean(r.tipo_activo)
          }
        : null;

      // Copiar las propiedades originales del registrador sin los campos intermedios del join
      const { tipo_id, tipo_nombre, tipo_descripcion, tipo_activo, ...registrador } = r;

      return {
        ...registrador,
        tipo
      };
    });

    res.json({
      data: mapped,
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
  const { nombre_registrador, id_tipo_registrador } = req.body;
  if (!nombre_registrador) {
    return res.status(400).json({
      data: null,
      message: "El nombre_registrador es requerido",
      error: null,
      status: 400
    });
  }
  
  try {
    // Si se proporciona id_tipo_registrador, verificar que existe
    if (id_tipo_registrador) {
      const [tipoRows]: any = await pool.query(
        "SELECT id FROM tipos_registradores WHERE id = ? AND activo = 1",
        [id_tipo_registrador]
      );
      if (tipoRows.length === 0) {
        return res.status(400).json({
          data: null,
          message: "El tipo de registrador especificado no existe o no está activo",
          error: null,
          status: 400
        });
      }
    }

    const [result]: any = await pool.query(
      "INSERT INTO registrador (nombre_registrador, id_tipo_registrador) VALUES (?, ?)",
      [nombre_registrador, id_tipo_registrador || null]
    );

    res.json({
      data: { 
        id: result.insertId, 
        nombre_registrador,
        id_tipo_registrador: id_tipo_registrador || null
      },
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




export const getRegistradoresConTipoActivos = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    // Primero verificar si hay brigadas activas
    const brigadaQuery = `
 SELECT 
          id_brigada,
          nombre_brigada,
          activa,
          max_tables_per_person,
          fecha_creacion
        FROM brigadas 
        WHERE activa = 1 
        ORDER BY fecha_creacion DESC 
        LIMIT 1
    `;

    const [brigadaRows]: any = await connection.query(brigadaQuery);
    const brigadaActiva = brigadaRows[0] || null;
    
    if (!brigadaActiva) {
      return res.status(400).json({
        success: false,
        message: 'No hay brigadas activas disponibles',
        data: []
      });
    }

    const query = `
    SELECT 
          r.id,
          r.nombre_registrador,
          r.id_tipo_registrador,
          tr.nombre_tipo,
          tr.descripcion as tipo_descripcion,
          tr.activo as tipo_activo
        FROM registrador r
        INNER JOIN tipos_registradores tr ON r.id_tipo_registrador = tr.id
        WHERE tr.activo = 1
        ORDER BY r.nombre_registrador ASC
    `;

    const [rows]: any = await connection.query(query);
    
    res.status(200).json({
      success: true,
      message: 'Registradores obtenidos exitosamente',
      data: rows,
      brigadaInfo: {
        id_evento: brigadaActiva.id_brigada,
        nombre_brigada: brigadaActiva.nombre_brigada,
        activa: brigadaActiva.activa
      },
      total: rows.length
    });
  } catch (error) {
    console.error('Error en getRegistradoresConTipoActivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: []
    });
  } finally {
    connection.release();
  }
};

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

export const updateRegistrador = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre_registrador, id_tipo_registrador } = req.body;

  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El ID del registrador es requerido",
      error: null,
      status: 400
    });
  }

  if (!nombre_registrador) {
    return res.status(400).json({
      data: null,
      message: "El nombre_registrador es requerido",
      error: null,
      status: 400
    });
  }

  try {
    // Verificar que el registrador existe
    const [existingRows]: any = await pool.query(
      "SELECT id FROM registrador WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        data: null,
        message: "Registrador no encontrado",
        error: null,
        status: 404
      });
    }

    // Si se proporciona id_tipo_registrador, verificar que existe
    if (id_tipo_registrador) {
      const [tipoRows]: any = await pool.query(
        "SELECT id FROM tipos_registradores WHERE id = ? AND activo = 1",
        [id_tipo_registrador]
      );
      if (tipoRows.length === 0) {
        return res.status(400).json({
          data: null,
          message: "El tipo de registrador especificado no existe o no está activo",
          error: null,
          status: 400
        });
      }
    }

    // Actualizar el registrador
    await pool.query(
      "UPDATE registrador SET nombre_registrador = ?, id_tipo_registrador = ? WHERE id = ?",
      [nombre_registrador, id_tipo_registrador || null, id]
    );

    res.json({
      data: {
        id: parseInt(id),
        nombre_registrador,
        id_tipo_registrador: id_tipo_registrador || null
      },
      message: "Registrador actualizado exitosamente",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al actualizar registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};

export const deleteRegistrador = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      data: null,
      message: "El ID del registrador es requerido",
      error: null,
      status: 400
    });
  }

  try {
    // Verificar que el registrador existe
    const [existingRows]: any = await pool.query(
      "SELECT id, nombre_registrador FROM registrador WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({
        data: null,
        message: "Registrador no encontrado",
        error: null,
        status: 404
      });
    }

    // Verificar si tiene registros asociados en otras tablas
    const [usageRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM users WHERE id_registrador = ?",
      [id]
    );

    const [entregasRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM entregas_tablas_registrador WHERE id_registrador = ?",
      [id]
    );

    const [usuariosOtrosRows]: any = await pool.query(
      "SELECT COUNT(*) as count FROM usuarios_otros_sorteos WHERE id_registrador = ?",
      [id]
    );

    const totalUsage = usageRows[0]?.count + entregasRows[0]?.count + usuariosOtrosRows[0]?.count;

    if (totalUsage > 0) {
      return res.status(400).json({
        data: null,
        message: "No se puede eliminar el registrador porque tiene registros asociados",
        error: "REGISTRADOR_HAS_DEPENDENCIES",
        status: 400
      });
    }

    // Eliminar el registrador
    await pool.query("DELETE FROM registrador WHERE id = ?", [id]);

    res.json({
      data: {
        id: parseInt(id),
        nombre_registrador: existingRows[0].nombre_registrador
      },
      message: "Registrador eliminado exitosamente",
      error: null,
      status: 200
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      message: "Error al eliminar registrador",
      error: error instanceof Error ? error.message : error,
      status: 500
    });
  }
};



