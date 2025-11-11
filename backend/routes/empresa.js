import express from 'express';
import linkedinAuthController from '../controllers/empresa/linkedinAuthController.js';
import registerController from '../controllers/empresa/registerController.js';
import loginController from '../controllers/empresa/loginController.js';
import updateController from '../controllers/empresa/updateController.js';
// import { authMiddleware } from '../middleware/auth.js'; // Descomentar quando tiver autenticação

const router = express.Router();

// Rotas de autenticação
router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.get('/verify-token', loginController.verifyToken);

// Rota de atualização de dados
router.put('/:id', updateController.update);

// Rotas de autenticação LinkedIn via Unipile Hosted Auth
router.get('/linkedin/auth', linkedinAuthController.initiateAuth);
router.post('/linkedin/webhook', linkedinAuthController.handleWebhook); // Webhook da Unipile
router.get('/linkedin/callback', linkedinAuthController.handleCallback); // Success redirect
router.post('/linkedin/disconnect', linkedinAuthController.disconnect);
router.get('/linkedin/status', linkedinAuthController.checkStatus);

export default router;

