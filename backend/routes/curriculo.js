import express from 'express';
import { curriculoController } from '../controllers/candidato/curriculoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas de currículo
router.post('/salvar', curriculoController.salvarCurriculo);
router.get('/buscar', curriculoController.buscarCurriculo);

// Rotas de teste comportamental
router.post('/teste-comportamental', curriculoController.salvarTesteComportamental);
router.get('/teste-comportamental/ultimo', curriculoController.buscarUltimoTeste);

export default router;

