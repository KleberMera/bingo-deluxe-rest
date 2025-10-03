import { Router } from "express";
import {
  overviewMetrics,
  brigadasWithCounts,
  registradoresPorBrigada,
  registrosPorMes,
  allMetrics
} from "../controllers/metricas.controller";

const router = Router();

router.get("/", allMetrics);
router.get("/overview", overviewMetrics);
router.get("/brigadas", brigadasWithCounts);
router.get("/brigadas/:id/registradores", registradoresPorBrigada);
router.get("/registros-por-mes", registrosPorMes);

export default router;
