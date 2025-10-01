import { Request, Response } from "express";

export const calcularTablasPorRango = (req: Request, res: Response) => {
  const { rango_inicio, rango_fin, numeracion_por_tabla } = req.body;
  const inicio = Number(rango_inicio);
  const fin = Number(rango_fin);
  const porTabla = Number(numeracion_por_tabla) || 4;

  if (isNaN(inicio) || isNaN(fin) || inicio > fin) {
    return res.status(400).json({
      data: null,
      message: "Rangos inválidos",
      error: null,
      status: 400
    });
  }

  const cantidad = (fin - inicio + 1);
  const total_tablas = Math.floor(cantidad / porTabla);
  const tablas: Array<{ rango_inicio: number, rango_fin: number }> = [];

  for (let i = inicio; i <= fin; i += porTabla) {
    const tabla_inicio = i;
    const tabla_fin = Math.min(i + porTabla - 1, fin);
    tablas.push({ rango_inicio: tabla_inicio, rango_fin: tabla_fin });
  }

  res.json({
    data: {
      tablas,
      total_tablas: tablas.length
    },
    message: "Cálculo realizado",
    error: null,
    status: 200
  });
};
