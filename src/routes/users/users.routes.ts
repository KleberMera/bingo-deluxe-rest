import { Router } from "express";
import { getUsers } from "../../controllers/users/users.controller";


const router = Router();

router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.post("/", createUser);

export default router;
