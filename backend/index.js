import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import jobsRoutes from './routes/jobs.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de log de requisições
app.use((req, res, next) => {
  console.log(`\n📥 [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('📍 Origin:', req.headers.origin || 'N/A');
  console.log('📍 Referer:', req.headers.referer || 'N/A');
  next();
});

// Middleware CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:8080',
  'http://[::1]:8080',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🌐 Origins permitidos pelo CORS:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (ex: Postman, mobile apps)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS: Origin permitido:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS: Origin bloqueado:', origin);
      console.log('📋 Origins permitidos:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Rotas
app.use('/auth', authRoutes);
app.use('/jobs', jobsRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor - forçar IPv4 e IPv6
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/auth`);
  console.log(`📋 Jobs API: http://localhost:${PORT}/jobs`);
  console.log(`🌐 Escutando em: 0.0.0.0:${PORT} (IPv4 e IPv6)`);
});

