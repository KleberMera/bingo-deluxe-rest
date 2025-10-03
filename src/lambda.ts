import serverless from '@codegenie/serverless-express';
import express from 'express';
import dotenv from 'dotenv';
import router from './routes';
import { responseFormatter } from './middleware/responseFormatter';

// Cargar variables de entorno
dotenv.config();

const app = express();

app.use(express.json());
app.use(responseFormatter);
app.use('/api', router);

// Manejador para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Exporta el manejador de serverless-http
export const handler = serverless({ app });