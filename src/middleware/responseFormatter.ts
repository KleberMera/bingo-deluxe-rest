import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para formatear todas las respuestas de la API
 */
export function responseFormatter(req: Request, res: Response, next: NextFunction) {
  // Sobreescribimos el método json de res
  const oldJson = res.json;
  res.json = function (data: any) {
    // Si ya está formateado, no lo formateamos de nuevo.
    // También preservamos respuestas que usan la convención { success: ... }
    // (por ejemplo los controladores portados desde JS que devuelven success, brigadaInfo, total, etc.)
    if (data && (
      (data.hasOwnProperty('data') && data.hasOwnProperty('message') && data.hasOwnProperty('status')) ||
      data.hasOwnProperty('success')
    )) {
      return oldJson.call(this, data);
    }
    // Estructura estándar
    const formatted = {
      data: data?.data ?? data ?? null,
      message: data?.message ?? '',
      error: data?.error ?? null,
      status: data?.status ?? res.statusCode ?? 200
    };
    return oldJson.call(this, formatted);
  };
  next();
}
