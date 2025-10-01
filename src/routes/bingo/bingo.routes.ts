import { Router } from "express";
import { searchBingoTable } from "../../controllers/bingo/bingo.controller";

const router = Router();

router.post("/search", searchBingoTable);

export default router;
