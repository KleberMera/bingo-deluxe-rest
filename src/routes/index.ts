import { Router } from "express";
import userRoutes from "./users/users.routes";
import bingoRoutes from "./bingo/bingo.routes";
import registradorRoutes from "./registrador/registrador.routes";
import brigadasRoutes from "./brigadas/brigadas.routes";
import entregasRoutes from "./entregas/entregas.routes";
import calculoRoutes from "./calculo/calculo.routes";
import locationRoutes from "./location/location.routes";

const router = Router();

// Prefijo para cada módulo
router.use("/users", userRoutes);
router.use("/bingo", bingoRoutes);
router.use("/registrador", registradorRoutes);
router.use("/brigadas", brigadasRoutes);
router.use("/entregas", entregasRoutes);

// Nuevos endpoints sin prefijo /v2
router.use("/location", locationRoutes);
router.use("/usuarios-otros", registradorRoutes);

router.use("/calculo", calculoRoutes);

export default router;
