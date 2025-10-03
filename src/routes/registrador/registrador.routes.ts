import { listRegistradores, createRegistrador, findRegistradorByName, getRegistradoresConTipoActivos } from './../../controllers/registrador/registrador.controller';
import { Router } from "express";

const router = Router();

router.get("/", listRegistradores);
router.post("/", createRegistrador);

router.get("/search", findRegistradorByName);

// Obtener registradores activos con su tipo
router.get('/activos-con-tipo', getRegistradoresConTipoActivos);

// Obtener registradores con tipo activos



export default router;
