import express from 'express';
import { authController } from '../controllers/candidato/authController.js';

const router = express.Router();

// Rotas de autenticação
router.post('/login/email', authController.loginWithEmail.bind(authController));
router.get('/login/linkedin', authController.loginWithLinkedIn.bind(authController));
router.get('/linkedin/callback', authController.linkedinCallback.bind(authController));
router.post('/verify', authController.verifyToken.bind(authController));
router.post('/logout', authController.logout.bind(authController));

export default router;

