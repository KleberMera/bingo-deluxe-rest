import { Router } from "express";
import * as usuariosOtrosController from "../../controllers/usuarios-otros/usuarios-otros.controller";

const router = Router();

// Verificar si un usuario existe por cédula
router.get('/check/:id_card', usuariosOtrosController.checkUserExistsByIdCard);

// Registrar un nuevo usuario
router.post('/register', usuariosOtrosController.registerUser);

// Actualizar cantidad de tablas
router.put('/cantidad-tablas/:id_card', usuariosOtrosController.updateCantidadTablas);

// Obtener todos los usuarios
router.get('/', usuariosOtrosController.getAllUsers);
// Resumen por tipo de registrador (agrupado)
router.get('/resumen/tipo-registrador', usuariosOtrosController.getResumenPorTipoRegistrador);

export default router;
