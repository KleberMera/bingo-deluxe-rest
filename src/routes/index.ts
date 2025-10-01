import { Router } from "express";
import userRoutes from "./users/users.routes";
import bingoRoutes from "./bingo/bingo.routes";

const router = Router();

// Prefijo para cada módulo
router.use("/users", userRoutes);

router.use("/bingo", bingoRoutes);

export default router;
