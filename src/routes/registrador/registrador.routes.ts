import { Router } from "express";
import { listRegistradores, createRegistrador, findRegistradorByName } from "../../controllers/registrador/registrador.controller";

const router = Router();

router.get("/", listRegistradores);
router.post("/", createRegistrador);

router.get("/search", findRegistradorByName);

export default router;
