import express from 'express';
import jobsController from '../controllers/empresa/jobsController.js';

const router = express.Router();

// GET /jobs - Listar todas as vagas
router.get('/', jobsController.getAllJobs.bind(jobsController));

// POST /jobs - Criar nova vaga
router.post('/', jobsController.createJob.bind(jobsController));

export default router;

