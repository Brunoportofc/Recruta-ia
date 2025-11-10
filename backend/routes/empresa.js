import express from 'express';
import linkedinAuthController from '../controllers/empresa/linkedinAuthController.js';
// import { authMiddleware } from '../middleware/auth.js'; // Descomentar quando tiver autenticação

const router = express.Router();

// Rotas de autenticação LinkedIn via Unipile Hosted Auth
router.get('/linkedin/auth', linkedinAuthController.initiateAuth);
router.post('/linkedin/webhook', linkedinAuthController.handleWebhook); // Webhook da Unipile
router.get('/linkedin/callback', linkedinAuthController.handleCallback); // Success redirect
router.post('/linkedin/disconnect', linkedinAuthController.disconnect);
router.get('/linkedin/status', linkedinAuthController.checkStatus);

export default router;

