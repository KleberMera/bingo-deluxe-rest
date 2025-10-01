import { Router } from "express";
import { calcularTablasPorRango } from "../../controllers/calculo/calculo.controller";

const router = Router();

router.post("/tablas-por-rango", calcularTablasPorRango);

export default router;
