import { Router } from "express";
import * as asistenciaController from "../../controllers/asistencia/asistencia.controller";

const router = Router();

// Registrar asistencia (toma brigada activa por defecto)
router.post("/", asistenciaController.registrarAsistencia);

// Obtener todas las asistencias (con filtro opcional por brigada)
router.get("/", asistenciaController.obtenerAsistencias);

// Obtener asistencias de la brigada activa
router.get("/brigada-activa", asistenciaController.obtenerAsistenciasPorBrigadaActiva);

// Obtener resumen de asistencias por brigada
router.get("/resumen", asistenciaController.obtenerResumenAsistencias);

// Eliminar una asistencia por ID
router.delete("/:id", asistenciaController.eliminarAsistencia);

export default router;
