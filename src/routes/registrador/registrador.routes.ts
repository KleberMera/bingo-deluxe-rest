import { listRegistradores, createRegistrador, findRegistradorByName, getRegistradoresConTipoActivos, checkUsuario, registerUsuario } from './../../controllers/registrador/registrador.controller';
import { Router } from "express";

const router = Router();

router.get("/", listRegistradores);
router.post("/", createRegistrador);

router.get("/search", findRegistradorByName);

// Obtener registradores activos con su tipo
router.get('/activos-con-tipo', getRegistradoresConTipoActivos);

// Obtener registradores con tipo activos

// Verificar si un usuario existe
router.get('/check/:identificacion', checkUsuario);

// Registrar un nuevo usuario
router.post('/register', registerUsuario);

export default router;
