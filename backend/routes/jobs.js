import express from 'express';
import jobsController from '../controllers/empresa/jobsController.js';

const router = express.Router();

// GET /jobs - Listar todas as vagas
router.get('/', jobsController.getAllJobs.bind(jobsController));

// GET /jobs/locations - Buscar localizações disponíveis da Unipile
router.get('/locations', jobsController.getLocations.bind(jobsController));

// POST /jobs - Criar nova vaga
router.post('/', jobsController.createJob.bind(jobsController));

export default router;

