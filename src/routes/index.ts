import { Router } from "express";
import userRoutes from "./users/users.routes";
import bingoRoutes from "./bingo/bingo.routes";
import registradorRoutes from "./registrador/registrador.routes";
import brigadasRoutes from "./brigadas/brigadas.routes";

const router = Router();

// Prefijo para cada módulo
router.use("/users", userRoutes);

router.use("/bingo", bingoRoutes);

router.use("/registrador", registradorRoutes);

router.use("/brigadas", brigadasRoutes);

export default router;
