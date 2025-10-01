import { Router } from "express";
import userRoutes from "./users.routes";

const router = Router();

// Prefijo para cada módulo
router.use("/users", userRoutes);

export default router;
