import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from '@/routes/auth';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança e parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Tratamento de rota não encontrada
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

export default app;
