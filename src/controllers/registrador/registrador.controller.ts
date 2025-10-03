
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



export const checkUsuario = async (req: Request, res: Response) => {
  try {
      const { identificacion } = req.params;
      const [rows]: any = await pool.query(
          'SELECT * FROM usuarios WHERE identificacion = $1',
          [identificacion]
      );
      
      if (rows.length > 0) {
          res.json({ 
              existe: true, 
              usuario: rows[0] 
          });
      } else {
          res.json({ 
              existe: false 
          });
      }
  } catch (error) {
      console.error('Error al verificar usuario:', error);
      res.status(500).json({ message: 'Error al verificar el usuario' });
  }
};

export const registerUsuario = async (req: Request, res: Response) => {
  try {
      const { 
          identificacion, 
          nombres, 
          apellidos, 
          email, 
          telefono,
          direccion,
          tipo_usuario_id,
          estado = 'ACTIVO'
      } = req.body;

      // Verificar si el usuario ya existe
      const [existeUsuario]: any = await pool.query(
          'SELECT id FROM usuarios WHERE identificacion = $1',
          [identificacion]
      );

      if (existeUsuario.length > 0) {
          return res.status(400).json({ 
              message: 'Ya existe un usuario con esta identificación' 
          });
      }

      // Insertar nuevo usuario
      const [result]: any = await pool.query(
          `INSERT INTO usuarios 
           (identificacion, nombres, apellidos, email, telefono, direccion, tipo_usuario_id, estado)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [identificacion, nombres, apellidos, email, telefono, direccion, tipo_usuario_id, estado]
      );

      res.status(201).json({
          message: 'Usuario registrado exitosamente',
          usuario: result[0]
      });
  } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ message: 'Error al registrar el usuario' });
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

      const [brigadaRows] : any = await connection.query(brigadaQuery);
      const brigadaActiva = brigadaRows[0] || null;
      
      if (!brigadaActiva) {
          return res.status(200).json({
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

      const [rows] : any = await connection.query(query);
      
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


export const getRegistradoresActivosConTipo = async (req: Request, res: Response) => {
  try {
      const [rows]: any = await pool.query(`
          SELECT r.*, t.nombre as tipo_registrador 
          FROM registradores r
          JOIN tipos_registrador t ON r.tipo_id = t.id
          WHERE r.estado = 'ACTIVO'
          ORDER BY r.nombres, r.apellidos
      `);
      res.json(rows);
  } catch (error) {
      console.error('Error al obtener registradores activos:', error);
      res.status(500).json({ message: 'Error al obtener los registradores activos' });
  }
};

