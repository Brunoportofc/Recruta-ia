import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'seu-secret-super-seguro-aqui';

/**
 * Middleware de autenticação
 * Verifica o token JWT e adiciona os dados do usuário em req.user
 */
export const authMiddleware = (req, res, next) => {
  try {
    console.log('🔐 [AUTH] Verificando autenticação...');
    
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ [AUTH] Token não fornecido no header');
      return res.status(401).json({
        success: false,
        message: 'Token não fornecido'
      });
    }

    console.log('🔐 [AUTH] Header Authorization presente');

    // Remove o prefixo "Bearer "
    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 [AUTH] Token extraído:', token.substring(0, 20) + '...');

    // Verifica e decodifica o token
    console.log('🔐 [AUTH] JWT_SECRET:', JWT_SECRET ? 'PRESENTE' : 'AUSENTE');
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ [AUTH] Token válido. Dados decodificados:', {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name
    });

    // Adiciona os dados do usuário na requisição
    req.user = {
      candidatoId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      linkedinId: decoded.linkedinId
    };

    console.log('✅ [AUTH] req.user definido:', req.user);

    next();
  } catch (error) {
    console.error('❌ [AUTH] Erro na autenticação:', error.message);
    console.error('❌ [AUTH] Stack:', error.stack);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado',
      error: error.message
    });
  }
};

