import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import jobsRoutes from './routes/jobs.js';
import authRoutes from './routes/auth.js';
import curriculoRoutes from './routes/curriculo.js';
import empresaRoutes from './routes/empresa.js';
import candidaturaRoutes from './routes/candidatura.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:8080',  // Frontend da EMPRESA
    'http://localhost:5174',  // Frontend do CANDIDATO
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove undefined se FRONTEND_URL não estiver definido
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Configuração de sessão (necessária para OAuth flow da Unipile)
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-secret-temporario-mude-isso-em-producao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
    httpOnly: true,
    maxAge: 1000 * 60 * 15 // 15 minutos
  }
}));

// Rotas
app.use('/auth', authRoutes);
app.use('/jobs', jobsRoutes);
app.use('/curriculo', curriculoRoutes);
app.use('/empresa', empresaRoutes);
app.use('/candidatura', candidaturaRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/auth`);
  console.log(`📋 Jobs API: http://localhost:${PORT}/jobs`);
  console.log(`📄 Curriculo API: http://localhost:${PORT}/curriculo`);
  console.log(`🏢 Empresa API: http://localhost:${PORT}/empresa`);
  console.log(`📝 Candidatura API: http://localhost:${PORT}/candidatura`);
});

