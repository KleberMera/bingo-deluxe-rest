import { Router } from "express";
import { listEntregas, createEntrega, updateEntrega, deleteEntrega, findByBrigadaRegistrador } from "../../controllers/entregas/entregas.controller";

const router = Router();

router.get("/", listEntregas);
router.post("/", createEntrega);
router.put("/:id", updateEntrega);
router.delete("/:id", deleteEntrega);
router.get("/search", findByBrigadaRegistrador);

export default router;
