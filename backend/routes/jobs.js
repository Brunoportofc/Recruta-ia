import express from 'express';
import jobsController from '../controllers/empresa/jobsController.js';

const router = express.Router();

// GET /jobs - Listar todas as vagas
router.get('/', jobsController.getAllJobs.bind(jobsController));

// GET /jobs/:id - Buscar vaga por ID
router.get('/:id', jobsController.getJobById.bind(jobsController));

// POST /jobs - Criar nova vaga
router.post('/', jobsController.createJob.bind(jobsController));

// PUT /jobs/:id - Atualizar vaga
router.put('/:id', jobsController.updateJob.bind(jobsController));

export default router;

