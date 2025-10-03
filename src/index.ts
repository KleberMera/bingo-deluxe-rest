import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import { responseFormatter } from "./middleware/responseFormatter";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//cors
app.use(cors());

// Middleware para formatear todas las respuestas
app.use(responseFormatter);

// Montar todas las rutas
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
