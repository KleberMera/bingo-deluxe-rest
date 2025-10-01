import { Router } from "express";
import { listBrigadas, createBrigada, updateBrigada } from "../../controllers/brigadas/brigadas.controller";

const router = Router();

router.get("/", listBrigadas);
router.post("/", createBrigada);
router.put("/:id_brigada", updateBrigada);

export default router;
