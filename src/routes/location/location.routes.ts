import { Router } from 'express';
import { 
    getProvincias, 
    getCantonesByProvincia, 
    getBarriosByCanton 
} from '../../controllers/location/location.controller';

const router = Router();

// Obtener todas las provincias
router.get('/provincias', getProvincias);

// Obtener cantones por provincia
router.get('/provincias/:provinciaId/cantones', getCantonesByProvincia);

// Obtener barrios por cantón
router.get('/cantones/:cantonId/barrios', getBarriosByCanton);

export default router;
