import { Router } from "express";
import {
  listTiposRegistradores,
  getTipoRegistradorById,
  createTipoRegistrador,
  updateTipoRegistrador,
  deleteTipoRegistrador,
  toggleTipoRegistradorStatus
} from "../../controllers/tipos-registradores/tipos-registradores.controller";

const router = Router();

// CRUD básico
router.get("/", listTiposRegistradores);
router.get("/:id", getTipoRegistradorById);
router.post("/", createTipoRegistrador);
router.put("/:id", updateTipoRegistrador);
router.delete("/:id", deleteTipoRegistrador);

// Acciones especiales
router.patch("/:id/toggle-status", toggleTipoRegistradorStatus);

export default router;
