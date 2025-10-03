import { Request, Response } from "express";
import pool from "../../config/db";

interface UsuarioOtroSorteo {
  id: number;
  first_name: string;
  last_name: string;
  id_card: string;
  phone?: string;
  provincia_id?: number;
  canton_id?: number;
  barrio_id?: number;
  latitud?: number;
  longitud?: number;
  ubicacion_detallada?: string;
  otp?: string | null;
  otp_expires_at?: Date | null;
  phone_verified: boolean | number;
  id_registrador?: number;
  id_tipo_registrador_snapshot?: number;
  nombre_tipo_registrador?: string;
  id_evento?: number;
  fecha_registro: Date;
  created_at: Date;
  updated_at: Date;
}

export const checkUserExistsByIdCard = async (req: Request, res: Response) => {
  const { id_card } = req.params;
  
  if (!id_card || !/^\d{10}$/.test(id_card)) {
    return res.status(400).json({
      success: false,
      message: 'Debe proporcionar una cédula válida de 10 dígitos',
      data: null,
      exists: false,
      brigadaInfo: null
    });
  }

  const connection = await pool.getConnection();
  
  try {
    // Primero, obtener la brigada activa
    const [brigadaRows]: any = await connection.query(
      `SELECT id_brigada, nombre_brigada, activa 
       FROM brigadas 
       WHERE activa = 1 
       ORDER BY fecha_creacion DESC 
       LIMIT 1`
    );

    if (brigadaRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay brigadas activas disponibles',
        data: null,
        exists: false,
        brigadaInfo: null
      });
    }

    const activeBrigade = brigadaRows[0];

    // Luego, verificar si el usuario existe
    const [userRows]: any = await connection.query(
      `SELECT * FROM usuarios_otros_sorteos WHERE id_card = ?`,
      [id_card]
    );

    const user = userRows[0] || null;
    
    const response = {
      success: true,
      message: user ? 'Usuario ya registrado' : 'Usuario no encontrado, puede continuar',
      data: user,
      exists: !!user,
      brigadaInfo: {
        id_evento: activeBrigade.id_brigada,
        nombre_brigada: activeBrigade.nombre_brigada,
        activa: activeBrigade.activa
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error en checkUserExistsByIdCard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      data: null,
      exists: false,
      brigadaInfo: null
    });
  } finally {
    connection.release();
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const {
    first_name,
    last_name,
    id_card,
    phone,
    provincia_id,
    canton_id,
    barrio_id,
    latitud,
    longitud,
    ubicacion_detallada,
    id_registrador,
    id_evento
  } = req.body;

  // Validaciones básicas
  if (!first_name || !last_name || !id_card) {
    return res.status(400).json({
      success: false,
      message: 'Los campos nombre, apellido y cédula son obligatorios'
    });
  }

  // Validar formato de cédula (10 dígitos)
  if (!/^\d{10}$/.test(id_card)) {
    return res.status(400).json({
      success: false,
      message: 'La cédula debe tener exactamente 10 dígitos'
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Verificar si el usuario ya existe
    const [existingUsers]: any = await connection.query(
      `SELECT * FROM usuarios_otros_sorteos WHERE id_card = ?`,
      [id_card]
    );

    if (existingUsers.length > 0) {
      await connection.rollback();
      const existing = existingUsers[0];
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario registrado con esta cédula',
        user: {
          id: existing.id,
          first_name: existing.first_name,
          last_name: existing.last_name,
          fecha_registro: existing.fecha_registro
        }
      });
    }

    // Insertar el nuevo usuario (usar id_registrador como en la versión JS)
    const [result]: any = await connection.query(
      `INSERT INTO usuarios_otros_sorteos (
        first_name, last_name, id_card, phone, provincia_id, 
        canton_id, barrio_id, latitud, longitud, ubicacion_detallada, 
        id_registrador, id_evento, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        first_name?.trim(),
        last_name?.trim(),
        id_card?.trim(),
        phone ? phone.trim() : null,
        provincia_id || null,
        canton_id || null,
        barrio_id || null,
        latitud || null,
        longitud || null,
        ubicacion_detallada ? ubicacion_detallada.trim() : null,
        id_registrador || null,
        id_evento || null
      ]
    );

    // Obtener el usuario recién creado
    const [newUser]: any = await connection.query(
      `SELECT * FROM usuarios_otros_sorteos WHERE id = ?`,
      [result.insertId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente en otros sorteos',
      data: {
        id: result.insertId,
        first_name,
        last_name,
        id_card,
        fecha_registro: new Date().toISOString()
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error en registerUser:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error interno del servidor'
    });
  } finally {
    connection.release();
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    // Obtener todos los usuarios ordenados por fecha de registro descendente
    const [rows] = await connection.query(
      `SELECT 
        id,
        first_name,
        last_name,
        id_card,
        phone,
        provincia_id,
        canton_id,
        barrio_id,
        latitud,
        longitud,
        ubicacion_detallada,
        otp,
        otp_expires_at,
        phone_verified,
        id_registrador,
        id_tipo_registrador_snapshot,
        nombre_tipo_registrador,
        id_evento,
        fecha_registro,
        created_at,
        updated_at
      FROM usuarios_otros_sorteos
      ORDER BY fecha_registro DESC`
    ) as unknown as [UsuarioOtroSorteo[]];
    
    const users = rows as UsuarioOtroSorteo[];

    res.status(200).json({
      success: true,
      message: 'Usuarios obtenidos exitosamente',
      data: users,
      count: Array.isArray(users) ? users.length : 0
    });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los usuarios',
      data: null
    });
  } finally {
    connection.release();
  }
};
