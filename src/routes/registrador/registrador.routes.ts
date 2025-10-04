import { listRegistradores, createRegistrador, findRegistradorByName, getRegistradoresConTipoActivos, listTiposRegistradores, updateRegistrador, deleteRegistrador } from './../../controllers/registrador/registrador.controller';
import { Router } from "express";

const router = Router();

router.get("/", listRegistradores);
router.post("/", createRegistrador);
router.put("/:id", updateRegistrador);
router.delete("/:id", deleteRegistrador);

router.get("/search", findRegistradorByName);

// Obtener registradores activos con su tipo
router.get('/activos-con-tipo', getRegistradoresConTipoActivos);

// Listar tipos de registradores
router.get('/tipos', listTiposRegistradores);



export default router;
