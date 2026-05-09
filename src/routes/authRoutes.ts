// As rotas de autenticação do BetterAuth são gerenciadas automaticamente
// pelo handler montado em server.ts: app.all("/api/auth/*splat", toNodeHandler(auth))
//
// Endpoints disponíveis do BetterAuth (prefixo /api/auth):
//
//   POST /api/auth/sign-up/email    -> Cadastro com email/senha
//   POST /api/auth/sign-in/email    -> Login com email/senha
//   POST /api/auth/sign-out         -> Logout (invalida sessão)
//   GET  /api/auth/get-session      -> Retorna sessão atual do usuário
//
// No app Android, após o login, enviar o token nas requisições:
//   Authorization: Bearer <token_da_sessao>
//
// Este arquivo pode ser usado para rotas personalizadas de auth,
// como buscar perfil completo do aluno/treinador autenticado.

import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import UsuarioRepository from "../repositories/usuarioRepository";

const router = express.Router();

// Exemplo: rota protegida para obter dados do usuário autenticado
router.get("/me", authMiddleware, async (req, res) => {
    const user = (req as any).user;
    const usuarioRepository = new UsuarioRepository();
    const perfil = await usuarioRepository.buscarPerfilAcesso(user.id);

    res.json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            type_usuario_autenticado: perfil.isTreinador ? "treinador" : "aluno",
            isAdmin: perfil.isAdmin,
        },
    });
});

export default router;