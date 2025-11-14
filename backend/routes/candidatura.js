import express from 'express';
import candidaturaController from '../controllers/candidato/candidaturaController.js';

const router = express.Router();

// POST /candidatura - Criar nova candidatura
router.post('/', candidaturaController.createCandidatura.bind(candidaturaController));

// GET /candidatura/vaga/:vagaId - Buscar candidaturas por vaga
router.get('/vaga/:vagaId', candidaturaController.getCandidaturasByVaga.bind(candidaturaController));

// GET /candidatura/:id - Buscar candidatura por ID
router.get('/:id', candidaturaController.getCandidaturaById.bind(candidaturaController));

export default router;

